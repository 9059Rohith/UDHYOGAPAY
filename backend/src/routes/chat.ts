// Backend comment: chat
import express from 'express';
import { protect } from '../middleware/auth';
import { getMessages, sendMessage, markAsRead } from '../controllers/chatController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get messages for a booking
router.get('/:bookingId', getMessages);

// Send a message
router.post('/:bookingId', sendMessage);

// Mark messages as read
router.patch('/:bookingId/read', markAsRead);

export default router;
