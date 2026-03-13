import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  worker: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'razorpay' | 'cash' | 'upi' | 'card' | 'netbanking';
  paymentGateway: 'razorpay' | 'manual';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  transactionStatus: 'created' | 'pending' | 'success' | 'failed' | 'refunded';
  transactionType: 'booking_payment' | 'refund' | 'payout';
  failureReason?: string;
  metadata?: any;
  verifiedAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    worker: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cash', 'upi', 'card', 'netbanking'],
      required: true
    },
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'manual'],
      default: 'razorpay'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    transactionStatus: {
      type: String,
      enum: ['created', 'pending', 'success', 'failed', 'refunded'],
      default: 'created'
    },
    transactionType: {
      type: String,
      enum: ['booking_payment', 'refund', 'payout'],
      default: 'booking_payment'
    },
    failureReason: String,
    metadata: Schema.Types.Mixed,
    verifiedAt: Date,
    refundedAt: Date,
    refundAmount: Number
  },
  {
    timestamps: true
  }
);

// Indexes
transactionSchema.index({ booking: 1 });
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ razorpayOrderId: 1 });
transactionSchema.index({ razorpayPaymentId: 1 });
transactionSchema.index({ transactionStatus: 1 });

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
