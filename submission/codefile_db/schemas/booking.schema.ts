import mongoose, { Document, Model, Schema } from 'mongoose';

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'started'
  | 'completed'
  | 'cancelled';

interface IBookingTimeline {
  requestedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

interface IBookingRating {
  stars: number;
  comment?: string;
  punctuality?: number;
  quality?: number;
  behavior?: number;
}

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  serviceType: 'plumber' | 'electrician' | 'carpenter' | 'cleaner' | 'painter';
  description: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  scheduledAt: Date;
  urgency: 'low' | 'medium' | 'high';
  status: BookingStatus;
  otp: string;
  otpVerified: boolean;
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
  price: number;
  paymentMethod: 'cash' | 'online' | 'upi';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  timeline: IBookingTimeline;
  rating?: IBookingRating;
}

const timelineSchema = new Schema<IBookingTimeline>(
  {
    requestedAt: { type: Date, default: Date.now },
    acceptedAt: Date,
    rejectedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date
  },
  { _id: false }
);

const ratingSchema = new Schema<IBookingRating>(
  {
    stars: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, maxlength: 500 },
    punctuality: { type: Number, min: 1, max: 5 },
    quality: { type: Number, min: 1, max: 5 },
    behavior: { type: Number, min: 1, max: 5 }
  },
  { _id: false }
);

const bookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    serviceType: {
      type: String,
      enum: ['plumber', 'electrician', 'carpenter', 'cleaner', 'painter'],
      required: true,
      index: true
    },
    description: { type: String, required: true, minlength: 10, maxlength: 500 },
    address: { type: String, required: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (arr: number[]) => arr.length === 2,
          message: 'location.coordinates must be [lng, lat]'
        }
      }
    },
    scheduledAt: { type: Date, required: true, index: true },
    urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'started', 'completed', 'cancelled'],
      default: 'pending',
      index: true
    },
    otp: { type: String, required: true, minlength: 4, maxlength: 6 },
    otpVerified: { type: Boolean, default: false },
    estimatedDistanceKm: { type: Number, default: 0, min: 0 },
    estimatedDurationMin: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 50 },
    paymentMethod: { type: String, enum: ['cash', 'online', 'upi'], default: 'cash' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    timeline: { type: timelineSchema, default: () => ({ requestedAt: new Date() }) },
    rating: { type: ratingSchema }
  },
  { timestamps: true }
);

bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ workerId: 1, status: 1 });
bookingSchema.index({ location: '2dsphere' });

bookingSchema.virtual('isOpen').get(function (this: IBooking) {
  return ['pending', 'accepted', 'started'].includes(this.status);
});

const Booking: Model<IBooking> =
  (mongoose.models.Booking as Model<IBooking>) || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
