import mongoose, { Document, Schema } from 'mongoose';

export interface IBookingPolicy extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  cancellationWindowHours: number;
  refundEligibilityPercentage: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bookingPolicySchema = new Schema<IBookingPolicy>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    cancellationWindowHours: {
      type: Number,
      required: true,
      min: 0
    },
    refundEligibilityPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

bookingPolicySchema.index({ name: 1 }, { unique: true });
bookingPolicySchema.index({ isActive: 1 });

export default mongoose.model<IBookingPolicy>('BookingPolicy', bookingPolicySchema);
