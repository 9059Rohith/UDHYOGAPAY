// Backend comment: reviews
import express from 'express';
import { protect } from '../middleware/auth';
import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  moderateReview,
  getWorkerReviews
} from '../controllers/reviewController';
import { isAdmin } from '../middleware/roleCheck';

const router = express.Router();

// Public routes
router.get('/worker/:workerId', getWorkerReviews);

// Protected routes (user)
router.post('/create', protect, createReview);
router.patch('/:id', protect, updateReview);

// Protected routes (all authenticated users)
router.get('/', protect, getAllReviews);
router.get('/:id', protect, getReviewById);

// Admin only routes
router.delete('/:id', protect, isAdmin, deleteReview);
router.patch('/:id/moderate', protect, isAdmin, moderateReview);

export default router;
