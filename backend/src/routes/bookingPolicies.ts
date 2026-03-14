import express from 'express';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';
import {
  createBookingPolicy,
  deleteBookingPolicy,
  getBookingPolicies,
  getBookingPolicyById,
  updateBookingPolicy
} from '../controllers/bookingPolicyController';

const router = express.Router();

router.post('/', protect, isAdmin, createBookingPolicy);
router.get('/', protect, isAdmin, getBookingPolicies);
router.get('/:id', protect, isAdmin, getBookingPolicyById);
router.patch('/:id', protect, isAdmin, updateBookingPolicy);
router.delete('/:id', protect, isAdmin, deleteBookingPolicy);

export default router;
