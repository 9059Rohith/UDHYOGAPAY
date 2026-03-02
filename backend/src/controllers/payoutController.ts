import { Response } from 'express';
import Payout from '../models/Payout';
import Booking from '../models/Booking';
import Worker from '../models/Worker';
import { AuthRequest } from '../middleware/auth';

/**
 * Create new payout
 * POST /api/payouts/create
 */
export const createPayout = async (req: AuthRequest, res: Response) => {
  try {
    const { workerId, periodStart, periodEnd, bookingIds, paymentMethod, accountDetails, commissionPercent } = req.body;

    if (!workerId || !periodStart || !periodEnd || !bookingIds || !paymentMethod || !accountDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Verify worker exists
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Get completed bookings and calculate total earnings
    const bookings = await Booking.find({
      _id: { $in: bookingIds },
      worker: workerId,
      status: 'completed',
      paymentStatus: 'paid'
    });

    if (bookings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid completed and paid bookings found'
      });
    }

    const totalEarnings = bookings.reduce((sum, booking) => sum + booking.pricing, 0);
    const commission = commissionPercent || 15;
    const commissionAmount = (totalEarnings * commission) / 100;
    const netPayout = totalEarnings - commissionAmount;

    // Create payout
    const payout = await Payout.create({
      worker: workerId,
      bookings: bookings.map(b => b._id),
      periodStart,
      periodEnd,
      totalEarnings,
      commissionPercent: commission,
      commissionAmount,
      netPayout,
      paymentMethod,
      accountDetails,
      payoutStatus: 'pending',
      processedBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      message: 'Payout created successfully',
      payout
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all payouts with filters
 * GET /api/payouts
 */
export const getAllPayouts = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.workerId) filter.worker = req.query.workerId;
    if (req.query.status) filter.payoutStatus = req.query.status;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.periodStart = {};
      if (req.query.startDate) filter.periodStart.$gte = new Date(req.query.startDate as string);
      if (req.query.endDate) filter.periodStart.$lte = new Date(req.query.endDate as string);
    }

    const payouts = await Payout.find(filter)
      .populate('worker', 'userId profession')
      .populate({
        path: 'worker',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payout.countDocuments(filter);

    // Calculate totals
    const stats = await Payout.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPayouts: { $sum: '$netPayout' },
          totalEarnings: { $sum: '$totalEarnings' },
          totalCommission: { $sum: '$commissionAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: payouts.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      stats: stats[0] || {},
      payouts
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get single payout by ID
 * GET /api/payouts/:id
 */
export const getPayoutById = async (req: AuthRequest, res: Response) => {
  try {
    const payout = await Payout.findById(req.params.id)
      .populate('worker', 'userId profession rating')
      .populate({
        path: 'worker',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate('bookings', 'profession pricing status createdAt')
      .populate('processedBy', 'name email');

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    res.status(200).json({
      success: true,
      payout
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update payout
 * PATCH /api/payouts/:id
 */
export const updatePayout = async (req: AuthRequest, res: Response) => {
  try {
    let payout = await Payout.findById(req.params.id);
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    const { paymentMethod, accountDetails, transactionReference, remarks, payoutStatus } = req.body;

    payout = await Payout.findByIdAndUpdate(
      req.params.id,
      {
        paymentMethod,
        accountDetails,
        transactionReference,
        remarks,
        payoutStatus,
        ...(payoutStatus === 'processing' && { processingDate: new Date() }),
        ...(payoutStatus === 'completed' && { completedDate: new Date() })
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Payout updated successfully',
      payout
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete payout
 * DELETE /api/payouts/:id
 */
export const deletePayout = async (req: AuthRequest, res: Response) => {
  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    // Only allow deletion of pending payouts
    if (payout.payoutStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete non-pending payouts'
      });
    }

    await payout.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Payout deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Process payout (update status)
 * PATCH /api/payouts/:id/process
 */
export const processPayout = async (req: AuthRequest, res: Response) => {
  try {
    const { status, transactionReference, failureReason } = req.body;

    if (!['processing', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updateData: any = {
      payoutStatus: status,
      processedBy: req.user?._id
    };

    if (status === 'processing') {
      updateData.processingDate = new Date();
    } else if (status === 'completed') {
      updateData.completedDate = new Date();
      updateData.transactionReference = transactionReference;
    } else if (status === 'failed') {
      updateData.failureReason = failureReason;
    }

    const payout = await Payout.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Payout ${status} successfully`,
      payout
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get worker payouts
 * GET /api/payouts/worker/:workerId
 */
export const getWorkerPayouts = async (req: AuthRequest, res: Response) => {
  try {
    const payouts = await Payout.find({ worker: req.params.workerId })
      .populate('bookings', 'profession pricing')
      .sort({ createdAt: -1 });

    const stats = await Payout.aggregate([
      { $match: { worker: req.params.workerId } },
      {
        $group: {
          _id: '$payoutStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$netPayout' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      payouts,
      stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Calculate pending earnings for worker
 * GET /api/payouts/worker/:workerId/pending
 */
export const calculatePendingEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const workerId = req.params.workerId;

    // Get completed and paid bookings that haven't been paid out
    const paidOutBookings = await Payout.find({ worker: workerId })
      .distinct('bookings');

    const pendingBookings = await Booking.find({
      worker: workerId,
      status: 'completed',
      paymentStatus: 'paid',
      _id: { $nin: paidOutBookings }
    });

    const pendingEarnings = pendingBookings.reduce((sum, booking) => sum + booking.pricing, 0);
    const commissionPercent = 15;
    const commissionAmount = (pendingEarnings * commissionPercent) / 100;
    const netPayout = pendingEarnings - commissionAmount;

    res.status(200).json({
      success: true,
      pendingBookingsCount: pendingBookings.length,
      totalEarnings: pendingEarnings,
      commissionPercent,
      commissionAmount,
      netPayout,
      bookings: pendingBookings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
