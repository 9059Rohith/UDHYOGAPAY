// Backend comment: bookingController
import { Response } from 'express';
import Booking from '../models/Booking';
import Worker from '../models/Worker';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { validateBooking } from '../utils/validators';
import { generateOTP, verifyOTP } from '../services/otpService';
import { emitToWorker, emitToUser, emitToAdmin } from '../services/socketService';
import { osmService } from '../services/osmService';

/**
 * Create a new booking
 * POST /api/bookings/create
 */
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { error } = validateBooking(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { workerId, profession, description, location } = req.body;

    // Check if worker exists and is available
    const worker = await Worker.findById(workerId).populate('userId');
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Check if worker is online and verified
    // Allow booking even if busy - let worker decide to accept/reject
    if (!worker.isOnline) {
      return res.status(400).json({
        success: false,
        message: 'Worker is currently offline'
      });
    }

    if (!worker.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Worker is not verified yet'
      });
    }

    // Calculate distance and ETA
    let estimatedDistance = 0;
    let estimatedTime = 0;
    let routeGeometry = null;

    try {
      const route = await osmService.getRoute(
        location.coordinates,
        worker.currentLocation.coordinates
      );
      estimatedDistance = route.distance;
      estimatedTime = route.duration;
      routeGeometry = route.geometry;
    } catch (err) {
      // Fallback to straight-line distance
      estimatedDistance = osmService.calculateDistance(
        location.coordinates,
        worker.currentLocation.coordinates
      );
      estimatedTime = (estimatedDistance / 30) * 60; // Assume 30 km/h
    }

    // Calculate pricing (₹100 base + ₹50 per km)
    const pricing = 100 + Math.round(estimatedDistance * 50);

    // Generate OTP
    const otp = generateOTP();

    // Get user location address
    let address = location.address || '';
    if (!address) {
      try {
        const geocoded = await osmService.reverseGeocode(
          location.coordinates[0],
          location.coordinates[1]
        );
        address = geocoded.displayName;
      } catch (err) {
        address = `${location.coordinates[1]}, ${location.coordinates[0]}`;
      }
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user?._id,
      worker: workerId,
      profession,
      description,
      location: {
        address,
        coordinates: location.coordinates
      },
      otp,
      estimatedDistance,
      estimatedTime,
      pricing,
      routeGeometry,
      status: 'pending',
      timeline: {
        requested: new Date()
      }
    });

    // Update worker availability
    worker.availability.status = 'busy';
    worker.availability.updatedAt = new Date();
    await worker.save();

    // Send real-time notification to worker via Socket.io
    emitToWorker(workerId.toString(), 'booking:request', {
      bookingId: booking._id,
      profession,
      distance: estimatedDistance,
      estimatedTime,
      userLocation: location.coordinates,
      pricing,
      timeout: 30000
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Waiting for worker acceptance.',
      booking,
      otp
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Worker accepts booking
 * PATCH /api/bookings/:id/accept
 */
export const acceptBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate('user');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify worker owns this booking
    const worker = await Worker.findOne({ userId: req.user?._id });
    if (!worker) {
      return res.status(403).json({
        success: false,
        message: 'Worker profile not found. Please complete your registration.'
      });
    }
    
    if (!worker.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your worker account is pending verification. Please contact admin.'
      });
    }
    
    // Compare booking worker ID with current worker ID
    const bookingWorkerId = booking.worker._id || booking.worker;
    if (bookingWorkerId.toString() !== worker._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This booking is not assigned to you'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking already processed'
      });
    }

    // Update booking status
    booking.status = 'accepted';
    booking.timeline.accepted = new Date();
    await booking.save();

    // Populate the full booking data for response
    await booking.populate('user worker');

    // Notify user via Socket.io
    const user = await User.findById(booking.user);
    emitToUser(booking.user._id.toString(), 'booking:accepted', {
      bookingId: booking._id,
      workerId: worker._id,
      workerName: user?.name,
      estimatedTime: booking.estimatedTime,
      otp: booking.otp
    });

    // Notify admin
    emitToAdmin('booking:status', {
      bookingId: booking._id,
      status: 'accepted',
      worker: worker.userId,
      user: booking.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Booking accepted successfully',
      booking,
      userLocation: {
        address: booking.location.address,
        coordinates: booking.location.coordinates,
        latitude: booking.location.coordinates[1],
        longitude: booking.location.coordinates[0]
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Worker rejects booking
 * PATCH /api/bookings/:id/reject
 */
export const rejectBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify worker owns this booking
    const worker = await Worker.findOne({ userId: req.user?._id });
    if (!worker || booking.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Update booking status
    booking.status = 'rejected';
    await booking.save();

    // Make worker available again
    worker.availability.status = 'available';
    await worker.save();

    // Notify user
    emitToUser(booking.user.toString(), 'booking:rejected', {
      bookingId: booking._id,
      message: 'Worker rejected the booking. Finding next available worker...'
    });

    // TODO: Find next best worker and send request
    // For now, just reject the booking

    res.status(200).json({
      success: true,
      message: 'Booking rejected successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Verify OTP and start job
 * POST /api/bookings/:id/verify-otp
 */
export const verifyOTPAndStart = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const booking = await Booking.findById(id).populate('user');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify worker owns this booking
    const worker = await Worker.findOne({ userId: req.user?._id });
    if (!worker || booking.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be accepted first'
      });
    }

    // Verify OTP
    if (!verifyOTP(otp, booking.otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Update booking
    booking.otpVerified = true;
    booking.status = 'started';
    booking.timeline.started = new Date();
    await booking.save();

    // Notify user
    const user = booking.user as any;
    emitToUser(booking.user.toString(), 'booking:started', {
      bookingId: booking._id,
      workerName: user.name
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified. Job started successfully.',
      booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Complete booking
 * PATCH /api/bookings/:id/complete
 */
export const completeBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify worker owns this booking
    const worker = await Worker.findOne({ userId: req.user?._id });
    if (!worker || booking.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (booking.status !== 'started' && booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be accepted or started first'
      });
    }

    // Auto-start if not started yet
    if (booking.status === 'accepted') {
      booking.status = 'started';
      booking.timeline.started = new Date();
      emitToUser(booking.user.toString(), 'booking:started', {
        bookingId: booking._id,
        message: 'Worker has started the work'
      });
    }

    // Update booking to completed
    booking.status = 'completed';
    booking.timeline.completed = new Date();
    await booking.save();

    // Update worker stats
    worker.totalJobs += 1;
    worker.availability.status = 'available';
    await worker.save();

    // Notify user to rate
    emitToUser(booking.user.toString(), 'booking:completed', {
      bookingId: booking._id,
      message: 'Service completed. Please rate the worker.'
    });

    // Notify worker
    emitToWorker(worker._id.toString(), 'booking:completed', {
      bookingId: booking._id
    });

    // Notify admin of completion
    emitToAdmin('booking:completed', {
      bookingId: booking._id,
      workerId: worker._id,
      userId: booking.user,
      profession: booking.profession,
      completedAt: booking.timeline.completed
    });

    res.status(200).json({
      success: true,
      message: 'Booking completed successfully',
      booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Rate worker
 * PATCH /api/bookings/:id/rate
 */
export const rateWorker = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating (1-5)'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify user owns this booking
    if (booking.user.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be completed first'
      });
    }

    // Update booking rating
    booking.rating = rating;
    booking.feedback = feedback || '';
    await booking.save();

    // Update worker's average rating
    const worker = await Worker.findById(booking.worker);
    if (worker) {
      const allBookings = await Booking.find({
        worker: worker._id,
        status: 'completed',
        rating: { $exists: true }
      });

      const avgRating =
        allBookings.reduce((sum, b) => sum + (b.rating || 0), 0) / allBookings.length;

      worker.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
      await worker.save();
    }

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get user booking history
 * GET /api/bookings/history
 */
export const getUserBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    const query: any = { user: req.user?._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('worker')
      .populate({
        path: 'worker',
        populate: {
          path: 'userId',
          select: 'name phone'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get worker booking history
 * GET /api/bookings/worker/history
 */
export const getWorkerBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    const worker = await Worker.findOne({ userId: req.user?._id });
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found'
      });
    }

    const query: any = { worker: worker._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Worker starts the work
 * PATCH /api/bookings/:id/start
 */
export const startWork = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('user', 'name phone')
      .populate({
        path: 'worker',
        populate: {
          path: 'userId',
          select: 'name phone'
        }
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be accepted first'
      });
    }

    booking.status = 'started';
    booking.timeline.started = new Date();
    await booking.save();

    // Notify user
    emitToUser(booking.user._id.toString(), 'booking:started', {
      bookingId: booking._id,
      message: 'Worker has started the work'
    });

    res.status(200).json({
      success: true,
      message: 'Work started successfully',
      booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Worker completes the work
 * PATCH /api/bookings/:id/complete
 */
export const completeWork = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const booking = await Booking.findById(id)
      .populate('user', 'name phone')
      .populate({
        path: 'worker',
        populate: {
          path: 'userId',
          select: 'name phone'
        }
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Allow completing from accepted or started status
    if (booking.status !== 'started' && booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Work must be accepted or started first'
      });
    }

    // If OTP provided, verify it
    if (otp) {
      if (booking.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP'
        });
      }
      booking.otpVerified = true;
    }

    // Auto-start if not started
    if (booking.status === 'accepted') {
      booking.timeline.started = new Date();
    }

    booking.status = 'completed';
    booking.timeline.completed = new Date();
    await booking.save();

    // Update worker stats
    const worker = await Worker.findById(booking.worker);
    if (worker) {
      worker.totalJobs += 1;
      worker.availability.status = 'available';
      worker.availability.updatedAt = new Date();
      await worker.save();
    }

    // Notify user
    emitToUser(booking.user._id.toString(), 'booking:completed', {
      bookingId: booking._id,
      message: 'Work completed. Please proceed with payment.'
    });

    // Notify admin of completion
    emitToAdmin('booking:completed', {
      bookingId: booking._id,
      workerId: booking.worker,
      userId: booking.user._id,
      profession: booking.profession,
      completedAt: booking.timeline.completed
    });

    res.status(200).json({
      success: true,
      message: 'Work completed successfully. Awaiting payment.',
      booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * User makes payment
 * PATCH /api/bookings/:id/payment
 */
export const makePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'cash' } = req.body;

    const booking = await Booking.findById(id)
      .populate('user', 'name')
      .populate({
        path: 'worker',
        populate: {
          path: 'userId',
          select: 'name'
        }
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Work must be completed first'
      });
    }

    booking.paymentStatus = 'paid';
    booking.paymentMethod = paymentMethod;
    await booking.save();

    // Notify worker
    emitToWorker(booking.worker._id.toString(), 'booking:payment', {
      bookingId: booking._id,
      message: 'Payment received',
      amount: booking.pricing
    });

    res.status(200).json({
      success: true,
      message: 'Payment successful',
      booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Worker confirms payment received
 * PATCH /api/bookings/:id/confirm-payment
 */
export const confirmPaymentReceived = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('user', 'name phone')
      .populate({
        path: 'worker',
        populate: {
          path: 'userId',
          select: 'name phone'
        }
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify worker owns this booking
    const worker = await Worker.findOne({ userId: req.user?._id });
    if (!worker || booking.worker._id.toString() !== worker._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Work must be completed first'
      });
    }

    // Mark payment as received
    booking.paymentStatus = 'paid';
    booking.paymentMethod = booking.paymentMethod || 'cash';
    await booking.save();

    // Notify user
    emitToUser(booking.user._id.toString(), 'booking:payment-confirmed', {
      bookingId: booking._id,
      message: 'Payment confirmed by worker. Thank you!'
    });

    // Notify admin
    emitToAdmin('booking:payment-confirmed', {
      bookingId: booking._id,
      workerId: worker._id,
      userId: booking.user._id,
      amount: booking.pricing,
      paymentMethod: booking.paymentMethod
    });

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get active booking for user
 * GET /api/bookings/active/user
 */
export const getUserActiveBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findOne({
      user: req.user?._id,
      status: { $in: ['pending', 'accepted', 'started', 'completed'] },
      paymentStatus: 'pending'
    })
      .populate({
        path: 'worker',
        populate: {
          path: 'userId',
          select: 'name phone'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get active booking for worker
 * GET /api/bookings/active/worker
 */
export const getWorkerActiveBooking = async (req: AuthRequest, res: Response) => {
  try {
    const worker = await Worker.findOne({ userId: req.user?._id });
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found'
      });
    }

    const booking = await Booking.findOne({
      worker: worker._id,
      status: { $in: ['pending', 'accepted', 'started', 'completed'] },
      paymentStatus: 'pending'
    })
      .populate('user', 'name phone email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get booking details
 * GET /api/bookings/:id
 */
export const getBookingDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('user', 'name phone email')
      .populate({
        path: 'worker',
        populate: {
          path: 'userId',
          select: 'name phone'
        }
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
