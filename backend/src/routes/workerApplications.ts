// Backend comment: workerApplications
import express from 'express';
import {
  submitWorkerApplication,
  getPendingApplications,
  approveWorkerApplication,
  rejectWorkerApplication,
  checkApplicationStatus
} from '../controllers/workerApplicationController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';
import { uploadAadhaar } from '../middleware/upload';

const router = express.Router();

// Public routes
router.post('/submit', uploadAadhaar, submitWorkerApplication);
router.post('/check-status', checkApplicationStatus);

// Admin routes
router.get('/pending', protect, isAdmin, getPendingApplications);
router.post('/:id/approve', protect, isAdmin, approveWorkerApplication);
router.post('/:id/reject', protect, isAdmin, rejectWorkerApplication);

export default router;
