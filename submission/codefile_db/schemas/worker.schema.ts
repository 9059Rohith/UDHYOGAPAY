import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWorker extends Document {
  userId: mongoose.Types.ObjectId;
  profession: 'plumber' | 'electrician' | 'carpenter' | 'cleaner' | 'painter';
  skills: string[];
  experience: number;
  hourlyRate: number;
  serviceRadiusKm: number;
  currentLocation: {
    type: 'Point';
    coordinates: [number, number];
    lastUpdated: Date;
  };
  isOnline: boolean;
  isVerified: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
  kycDocuments: {
    aadhaarFront?: string;
    aadhaarBack?: string;
    selfie?: string;
    skillCertificate?: string;
    policeVerification?: string;
  };
  kycRejectionReason?: string;
  rating: number;
  ratingsCount: number;
  completedBookings: number;
  earnings: {
    lifetime: number;
    thisMonth: number;
    pendingPayout: number;
  };
}

const workerSchema = new Schema<IWorker>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    profession: {
      type: String,
      enum: ['plumber', 'electrician', 'carpenter', 'cleaner', 'painter'],
      required: true,
      index: true
    },
    skills: { type: [String], default: [] },
    experience: { type: Number, required: true, min: 0, max: 50 },
    hourlyRate: { type: Number, required: true, min: 50, max: 10000 },
    serviceRadiusKm: { type: Number, default: 15, min: 1, max: 100 },
    currentLocation: {
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
          message: 'currentLocation.coordinates must be [lng, lat]'
        }
      },
      lastUpdated: { type: Date, default: Date.now }
    },
    isOnline: { type: Boolean, default: false, index: true },
    isVerified: { type: Boolean, default: false, index: true },
    kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    kycDocuments: {
      aadhaarFront: String,
      aadhaarBack: String,
      selfie: String,
      skillCertificate: String,
      policeVerification: String
    },
    kycRejectionReason: { type: String, trim: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0, min: 0 },
    completedBookings: { type: Number, default: 0, min: 0 },
    earnings: {
      lifetime: { type: Number, default: 0, min: 0 },
      thisMonth: { type: Number, default: 0, min: 0 },
      pendingPayout: { type: Number, default: 0, min: 0 }
    }
  },
  { timestamps: true }
);

workerSchema.index({ currentLocation: '2dsphere' });
workerSchema.index({ profession: 1, isOnline: 1, isVerified: 1 });
workerSchema.index({ rating: -1, experience: -1 });

workerSchema.virtual('availability').get(function (this: IWorker) {
  if (!this.isVerified) return 'unverified';
  return this.isOnline ? 'available' : 'offline';
});

const Worker: Model<IWorker> =
  (mongoose.models.Worker as Model<IWorker>) || mongoose.model<IWorker>('Worker', workerSchema);

export default Worker;
