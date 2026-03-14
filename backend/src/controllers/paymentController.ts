// Backend comment: paymentController
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Transaction from '../models/Transaction';
import Booking from '../models/Booking';
import Worker from '../models/Worker';
import razorpayService from '../services/razorpayService';

/**
 * Create Razorpay order for booking payment
 * POST /api/payments/create-order
 */
export const createPaymentOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email phone')
      .populate('worker');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify user owns this booking
    if (booking.user._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be made for completed bookings'
      });
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been paid'
      });
    }

    // Convert amount to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(booking.pricing * 100);

    // Create Razorpay order
    const orderResult = await razorpayService.createOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId: bookingId,
        userId: req.user?._id,
        workerId: booking.worker._id
      }
    });

    if (!orderResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: orderResult.error
      });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      booking: bookingId,
      user: req.user?._id,
      worker: booking.worker._id,
      amount: booking.pricing,
      currency: 'INR',
      paymentMethod: 'razorpay',
      paymentGateway: 'razorpay',
      razorpayOrderId: orderResult.order?.id,
      transactionStatus: 'created',
      transactionType: 'booking_payment',
      metadata: {
        bookingDetails: {
          profession: booking.profession,
          createdAt: booking.timeline?.requested
        }
      }
    });

    // Update booking payment status to pending
    booking.paymentStatus = 'pending';
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: orderResult.order?.id,
        amount: booking.pricing,
        currency: 'INR',
        transactionId: transaction._id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        bookingDetails: {
          id: booking._id,
          profession: booking.profession
        }
      }
    });
  } catch (error: any) {
    console.error('Create Payment Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Verify Razorpay payment
 * POST /api/payments/verify
 */
export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    // Verify signature
    const isValid = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!isValid) {
      // Update transaction as failed
      await Transaction.findOneAndUpdate(
        { razorpayOrderId },
        {
          transactionStatus: 'failed',
          failureReason: 'Invalid payment signature'
        }
      );

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }

    // Get payment details from Razorpay
    const paymentDetails = await razorpayService.getPaymentDetails(razorpayPaymentId);

    if (!paymentDetails.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payment details'
      });
    }

    // Update transaction
    const transaction = await Transaction.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        transactionStatus: 'success',
        paymentMethod: paymentDetails.payment?.method || 'razorpay',
        verifiedAt: new Date(),
        metadata: paymentDetails.payment || {}
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Update booking payment status
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'paid',
        paymentMethod: paymentDetails.payment?.method === 'card' ? 'online' : 'upi'
      },
      { new: true }
    ).populate('worker');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and completed successfully',
      data: {
        transaction,
        booking: {
          id: booking._id,
          paymentStatus: booking.paymentStatus,
          amount: booking.pricing
        }
      }
    });
  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Handle Razorpay webhook
 * POST /api/payments/webhook
 */
export const handleWebhook = async (req: any, res: Response) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    const isValid = razorpayService.verifyPaymentSignature({
      razorpayOrderId: req.body.payload.payment.entity.order_id,
      razorpayPaymentId: req.body.payload.payment.entity.id,
      razorpaySignature: webhookSignature as string
    });

    if (!isValid && webhookSecret) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await Transaction.findOneAndUpdate(
          { razorpayOrderId: paymentEntity.order_id },
          {
            razorpayPaymentId: paymentEntity.id,
            transactionStatus: 'success',
            verifiedAt: new Date()
          }
        );
        break;

      case 'payment.failed':
        await Transaction.findOneAndUpdate(
          { razorpayOrderId: paymentEntity.order_id },
          {
            transactionStatus: 'failed',
            failureReason: paymentEntity.error_description
          }
        );
        break;

      case 'refund.created':
        await Transaction.findOneAndUpdate(
          { razorpayPaymentId: paymentEntity.payment_id },
          {
            transactionStatus: 'refunded',
            refundedAt: new Date(),
            refundAmount: paymentEntity.amount / 100
          }
        );
        break;
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get transaction history for user
 * GET /api/payments/history
 */
export const getTransactionHistory = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = { user: req.user?._id };

    if (req.query.status) {
      filter.transactionStatus = req.query.status;
    }

    const transactions = await Transaction.find(filter)
      .populate('booking', 'serviceType scheduledDate')
      .populate('worker', 'profession')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Refund payment
 * POST /api/payments/refund
 */
export const refundPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId, reason, amount } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.transactionStatus !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund successful transactions'
      });
    }

    if (!transaction.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID not found'
      });
    }

    // Process refund
    const refundAmount = amount ? Math.round(amount * 100) : undefined;
    const refundResult = await razorpayService.refundPayment(
      transaction.razorpayPaymentId,
      refundAmount
    );

    if (!refundResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Refund failed',
        error: refundResult.error
      });
    }

    // Update transaction
    transaction.transactionStatus = 'refunded';
    transaction.refundedAt = new Date();
    transaction.refundAmount = amount || transaction.amount;
    transaction.metadata = {
      ...transaction.metadata,
      refundReason: reason,
      refundDetails: refundResult.refund
    };
    await transaction.save();

    // Update booking
    await Booking.findByIdAndUpdate(transaction.booking, {
      paymentStatus: 'refunded'
    });

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refund: refundResult.refund,
        transaction
      }
    });
  } catch (error: any) {
    console.error('Refund Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Manual cash payment (for cash on completion)
 * POST /api/payments/cash
 */
export const recordCashPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('worker');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be completed first'
      });
    }

    // Create cash transaction
    const transaction = await Transaction.create({
      booking: bookingId,
      user: req.user?._id,
      worker: booking.worker._id,
      amount: booking.pricing,
      currency: 'INR',
      paymentMethod: 'cash',
      paymentGateway: 'manual',
      transactionStatus: 'success',
      transactionType: 'booking_payment',
      verifiedAt: new Date()
    });

    // Update booking
    booking.paymentStatus = 'paid';
    booking.paymentMethod = 'cash';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Cash payment recorded successfully',
      data: {
        transaction,
        booking
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
