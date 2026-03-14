// Backend comment: payouts
import express from 'express';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';
import {
  createPayout,
  getAllPayouts,
  getPayoutById,
  updatePayout,
  deletePayout,
  processPayout,
  getWorkerPayouts,
  calculatePendingEarnings
} from '../controllers/payoutController';

const router = express.Router();

// Admin only routes
router.post('/create', protect, isAdmin, createPayout);
router.get('/', protect, isAdmin, getAllPayouts);
router.get('/:id', protect, getPayoutById);
router.patch('/:id', protect, isAdmin, updatePayout);
router.delete('/:id', protect, isAdmin, deletePayout);
router.patch('/:id/process', protect, isAdmin, processPayout);

// Worker can view their own payouts
router.get('/worker/:workerId', protect, getWorkerPayouts);
router.get('/worker/:workerId/pending', protect, calculatePendingEarnings);

export default router;
