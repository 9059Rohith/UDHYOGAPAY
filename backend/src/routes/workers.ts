// Backend comment: workers
import express from 'express';
import {
  uploadKYC,
  toggleOnline,
  updateLocation,
  getWorkerProfile
} from '../controllers/workerController';
import { protect } from '../middleware/auth';
import { isWorker } from '../middleware/roleCheck';
import { uploadKYC as uploadMiddleware } from '../middleware/upload';

const router = express.Router();

router.post('/kyc', protect, isWorker, uploadMiddleware, uploadKYC);
router.patch('/toggle-online', protect, isWorker, toggleOnline);
router.patch('/location', protect, isWorker, updateLocation);
router.get('/profile', protect, isWorker, getWorkerProfile);

export default router;
