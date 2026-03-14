import express from 'express';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';
import { getCancellationReport, getPaymentSummary } from '../controllers/reportController';

const router = express.Router();

router.get('/payments/summary', protect, isAdmin, getPaymentSummary);
router.get('/cancellations/summary', protect, isAdmin, getCancellationReport);

export default router;
