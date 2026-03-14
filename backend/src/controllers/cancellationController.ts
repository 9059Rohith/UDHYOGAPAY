import { Request, Response } from 'express';
import Booking from '../models/Booking';
import BookingCancellation from '../models/BookingCancellation';

interface CancellationPayload {
  bookingId: string;
  reason: string;
  refundAmount: number;
}

export const processCancellation = async (
  req: Request<unknown, unknown, CancellationPayload>,
  res: Response
) => {
  try {
    const { bookingId, reason } = req.body;
    const refundAmount = Number(req.body.refundAmount);

    if (!bookingId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'bookingId and reason are required'
      });
    }

    if (Number.isNaN(refundAmount) || refundAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'refundAmount must be a valid non-negative number'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    const cancellation = await BookingCancellation.create({
      bookingId: booking._id,
      reason: reason.trim(),
      refundAmount,
      status: 'processed',
      cancelledAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Cancellation processed and refund logged successfully',
      data: cancellation
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process cancellation';
    return res.status(500).json({ success: false, message });
  }
};
