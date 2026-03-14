// Backend comment: reviewController
import { Response } from 'express';
import Review from '../models/Review';
import Booking from '../models/Booking';
import Worker from '../models/Worker';
import { AuthRequest } from '../middleware/auth';

/**
 * Create a new review
 * POST /api/reviews/create
 */
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      bookingId, 
      rating, 
      reviewTitle, 
      reviewComment, 
      goodAttributes,
      whatToImprove,
      serviceQuality, 
      punctuality, 
      cleanliness, 
      wouldRecommend 
    } = req.body;

    // Validate required fields
    if (!bookingId || !rating || !reviewComment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Check if booking belongs to user (allow admin to create reviews for any booking)
    if (booking.user.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own bookings'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    // Create review
    const review = await Review.create({
      booking: bookingId,
      user: req.user?._id,
      worker: booking.worker,
      rating,
      reviewTitle: reviewTitle || 'Service Review',
      reviewComment,
      goodAttributes,
      whatToImprove,
      serviceQuality: serviceQuality || rating,
      punctuality: punctuality || rating,
      cleanliness: cleanliness || rating,
      wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true,
      status: 'approved' // Auto-approve for now
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('worker', 'profession')
      .populate('booking', 'profession pricing');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review: populatedReview
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all reviews with pagination and filters
 * GET /api/reviews
 */
export const getAllReviews = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.workerId) filter.worker = req.query.workerId;
    if (req.query.userId) filter.user = req.query.userId;
    if (req.query.minRating) filter.rating = { $gte: parseInt(req.query.minRating as string) };

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate({
        path: 'worker',
        select: 'profession',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate('booking', 'profession pricing createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      reviews
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get single review by ID
 * GET /api/reviews/:id
 */
export const getReviewById = async (req: AuthRequest, res: Response) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate({
        path: 'worker',
        select: 'profession rating totalJobs',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate('booking', 'profession pricing status createdAt');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      review
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update review
 * PATCH /api/reviews/:id
 */
export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    let review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization
    if (review.user.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const { rating, reviewTitle, reviewComment, serviceQuality, punctuality, cleanliness, wouldRecommend } = req.body;

    review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        rating,
        reviewTitle,
        reviewComment,
        serviceQuality,
        punctuality,
        cleanliness,
        wouldRecommend
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete review (Admin only)
 * DELETE /api/reviews/:id
 */
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Moderate review (Admin only)
 * PATCH /api/reviews/:id/moderate
 */
export const moderateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { status, moderationNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        status,
        moderatedBy: req.user?._id,
        moderationNotes
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Review ${status} successfully`,
      review
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get worker reviews
 * GET /api/reviews/worker/:workerId
 */
export const getWorkerReviews = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await Review.find({ 
      worker: req.params.workerId,
      status: 'approved'
    })
      .populate('user', 'name')
      .populate('booking', 'profession createdAt')
      .sort({ createdAt: -1 });

    const stats = await Review.aggregate([
      { $match: { worker: req.params.workerId, status: 'approved' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          avgServiceQuality: { $avg: '$serviceQuality' },
          avgPunctuality: { $avg: '$punctuality' },
          avgCleanliness: { $avg: '$cleanliness' },
          totalReviews: { $sum: 1 },
          recommendCount: { $sum: { $cond: ['$wouldRecommend', 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      reviews,
      stats: stats[0] || {}
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
