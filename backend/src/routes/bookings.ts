// Backend comment: bookings
import express from 'express';
import {
  createBooking,
  acceptBooking,
  rejectBooking,
  verifyOTPAndStart,
  completeBooking,
  rateWorker,
  getUserBookings,
  getWorkerBookings,
  getBookingDetails,
  startWork,
  completeWork,
  makePayment,
  getUserActiveBooking,
  getWorkerActiveBooking,
  confirmPaymentReceived
} from '../controllers/bookingController';
import { protect } from '../middleware/auth';
import { isUser, isWorker } from '../middleware/roleCheck';

const router = express.Router();

// User routes
router.post('/create', protect, isUser, createBooking);
router.get('/history', protect, isUser, getUserBookings);
router.patch('/:id/rate', protect, isUser, rateWorker);
router.patch('/:id/payment', protect, isUser, makePayment);
router.get('/active/user', protect, isUser, getUserActiveBooking);

// Worker routes
router.patch('/:id/accept', protect, isWorker, acceptBooking);
router.patch('/:id/reject', protect, isWorker, rejectBooking);
router.post('/:id/verify-otp', protect, isWorker, verifyOTPAndStart);
router.patch('/:id/start', protect, isWorker, startWork);
router.patch('/:id/complete', protect, isWorker, completeWork);
router.patch('/:id/confirm-payment', protect, isWorker, confirmPaymentReceived);
router.get('/worker/history', protect, isWorker, getWorkerBookings);
router.get('/active/worker', protect, isWorker, getWorkerActiveBooking);

// Shared routes
router.get('/:id', protect, getBookingDetails);

export default router;
