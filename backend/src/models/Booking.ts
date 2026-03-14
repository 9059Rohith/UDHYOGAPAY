// Backend comment: Booking
import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  worker: mongoose.Types.ObjectId;
  profession: string;
  description: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  status: 'pending' | 'accepted' | 'rejected' | 'started' | 'completed' | 'cancelled';
  otp: string;
  otpVerified: boolean;
  estimatedDistance: number;
  estimatedTime: number;
  pricing: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'cash' | 'online' | 'upi';
  timeline: {
    requested?: Date;
    accepted?: Date;
    started?: Date;
    completed?: Date;
  };
  rating?: number;
  feedback?: string;
  routeGeometry?: any; // GeoJSON LineString
}

const BookingSchema = new Schema<IBooking>({
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
  profession: {
    type: String,
    required: true,
    enum: ['plumber', 'electrician', 'carpenter', 'painter', 'cleaner']
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    address: {
      type: String,
      default: ''
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'started', 'completed', 'cancelled'],
    default: 'pending'
  },
  otp: {
    type: String,
    required: true
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  estimatedDistance: {
    type: Number,
    default: 0
  },
  estimatedTime: {
    type: Number,
    default: 0
  },
  pricing: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'upi'],
    default: 'cash'
  },
  timeline: {
    requested: {
      type: Date,
      default: Date.now
    },
    accepted: Date,
    started: Date,
    completed: Date
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
  routeGeometry: Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ user: 1 });
BookingSchema.index({ worker: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
