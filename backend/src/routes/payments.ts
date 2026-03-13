import express from 'express';
import { protect } from '../middleware/auth';
import { isUser, isAdmin } from '../middleware/roleCheck';
import {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getTransactionHistory,
  refundPayment,
  recordCashPayment
} from '../controllers/paymentController';

const router = express.Router();

// User routes
router.post('/create-order', protect, isUser, createPaymentOrder);
router.post('/verify', protect, isUser, verifyPayment);
router.post('/cash', protect, isUser, recordCashPayment);
router.get('/history', protect, getTransactionHistory);

// Admin routes
router.post('/refund', protect, isAdmin, refundPayment);

// Webhook (no auth - verified by signature)
router.post('/webhook', handleWebhook);

export default router;
