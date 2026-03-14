// Backend comment: WorkerApplication
import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkerApplication extends Document {
  name: string;
  personalEmail: string;
  phone: string;
  profession: 'plumber' | 'electrician' | 'carpenter' | 'painter' | 'cleaner';
  experience: number;
  address: string;
  documents: {
    aadhaarFront?: {
      url: string;
      uploadedAt: Date;
    };
    aadhaarBack?: {
      url: string;
      uploadedAt: Date;
    };
    policeVerification?: {
      url: string;
      uploadedAt: Date;
    };
  };
  kycStatus: 'pending' | 'approved' | 'rejected';
  kycRejectionReason?: string;
  status: 'pending' | 'approved' | 'rejected';
  workEmail?: string; // Admin-provided email like worker1@udhyogapay.com
  userId?: mongoose.Types.ObjectId; // Created after approval
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
}

const WorkerApplicationSchema = new Schema<IWorkerApplication>({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  personalEmail: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    unique: true,
    match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
  },
  profession: {
    type: String,
    required: [true, 'Please specify your profession'],
    enum: ['plumber', 'electrician', 'carpenter', 'painter', 'cleaner']
  },
  experience: {
    type: Number,
    required: [true, 'Please specify years of experience'],
    min: 0,
    max: 50
  },
  address: {
    type: String,
    required: [true, 'Please provide your address']
  },
  documents: {
    aadhaarFront: {
      url: String,
      uploadedAt: Date
    },
    aadhaarBack: {
      url: String,
      uploadedAt: Date
    },
    policeVerification: {
      url: String,
      uploadedAt: Date
    }
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  kycRejectionReason: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  workEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
WorkerApplicationSchema.index({ status: 1, submittedAt: -1 });

export default mongoose.model<IWorkerApplication>('WorkerApplication', WorkerApplicationSchema);
