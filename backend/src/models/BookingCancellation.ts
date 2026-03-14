import mongoose, { Document, Schema } from 'mongoose';

export type BookingCancellationStatus = 'pending' | 'processed';

export interface IBookingCancellation extends Document {
  bookingId: mongoose.Types.ObjectId;
  reason: string;
  refundAmount: number;
  status: BookingCancellationStatus;
  cancelledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingCancellationSchema = new Schema<IBookingCancellation>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    refundAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'processed'],
      default: 'pending'
    },
    cancelledAt: {
      type: Date,
      default: Date.now,
      required: true
    }
  },
  {
    timestamps: true
  }
);

bookingCancellationSchema.index({ reason: 1, cancelledAt: -1 });
bookingCancellationSchema.index({ status: 1 });

export default mongoose.model<IBookingCancellation>('BookingCancellation', bookingCancellationSchema);
