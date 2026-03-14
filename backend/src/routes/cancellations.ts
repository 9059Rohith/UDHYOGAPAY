import express from 'express';
import { protect } from '../middleware/auth';
import { processCancellation } from '../controllers/cancellationController';

const router = express.Router();

router.post('/process', protect, processCancellation);

export default router;
