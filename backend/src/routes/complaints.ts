// Backend comment: complaints
import express from 'express';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  getComplaintById,
  deleteComplaint
} from '../controllers/complaintController';

const router = express.Router();

// Protected routes (User/Worker)
router.use(protect);
router.post('/create', createComplaint);
router.get('/my-complaints', getMyComplaints);
router.get('/:id', getComplaintById);

// Admin-only routes
router.get('/admin/all', isAdmin, getAllComplaints);
router.patch('/admin/:id/update', isAdmin, updateComplaintStatus);
router.delete('/admin/:id', isAdmin, deleteComplaint);

export default router;
