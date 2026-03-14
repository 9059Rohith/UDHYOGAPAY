// Backend comment: chatController
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Message from '../models/Message';
import Booking from '../models/Booking';
import { emitToUser, emitToWorker } from '../services/socketService';

/**
 * Get all messages for a booking
 * GET /api/chat/:bookingId
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?._id;

    // Verify user has access to this booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const messages = await Message.find({ booking: bookingId })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Send a message
 * POST /api/chat/:bookingId
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { message, type = 'text' } = req.body;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Verify booking exists
    const booking = await Booking.findById(bookingId)
      .populate('user', 'name')
      .populate('worker');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Create message
    const newMessage = await Message.create({
      booking: bookingId,
      sender: userId,
      senderRole: userRole,
      message,
      type
    });

    // Emit socket event to receiver
    if (userRole === 'user') {
      emitToWorker(booking.worker.toString(), 'chat:message', {
        bookingId,
        message: newMessage
      });
    } else {
      emitToUser(booking.user.toString(), 'chat:message', {
        bookingId,
        message: newMessage
      });
    }

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Mark messages as read
 * PATCH /api/chat/:bookingId/read
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    await Message.updateMany(
      {
        booking: bookingId,
        senderRole: { $ne: userRole },
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
