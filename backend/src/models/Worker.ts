// Backend comment: Worker
import mongoose, { Document, Schema } from 'mongoose';

export interface IWorker extends Document {
  userId: mongoose.Types.ObjectId;
  profession: 'plumber' | 'electrician' | 'carpenter' | 'painter' | 'cleaner';
  experience: number;
  isVerified: boolean;
  isOnline: boolean;
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
  rating: number;
  totalJobs: number;
  currentLocation: {
    type: string;
    coordinates: [number, number];
    lastUpdated: Date;
  };
  availability: {
    status: 'available' | 'busy' | 'offline';
    updatedAt: Date;
  };
}

const WorkerSchema = new Schema<IWorker>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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
  isVerified: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
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
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalJobs: {
    type: Number,
    default: 0
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'offline'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Create geospatial index for worker location
WorkerSchema.index({ currentLocation: '2dsphere' });
WorkerSchema.index({ isOnline: 1, isVerified: 1 });
WorkerSchema.index({ profession: 1 });

export default mongoose.model<IWorker>('Worker', WorkerSchema);
