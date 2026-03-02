import mongoose, { Document, Schema } from 'mongoose';

export interface IPayout extends Document {
  worker: mongoose.Types.ObjectId;
  bookings: mongoose.Types.ObjectId[];
  periodStart: Date;
  periodEnd: Date;
  totalEarnings: number;
  commissionPercent: number;
  commissionAmount: number;
  netPayout: number;
  paymentMethod: 'bank_transfer' | 'upi' | 'cash';
  accountDetails: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  };
  payoutStatus: 'pending' | 'processing' | 'completed' | 'failed';
  transactionReference?: string;
  processedBy?: mongoose.Types.ObjectId;
  processingDate?: Date;
  completedDate?: Date;
  failureReason?: string;
  remarks?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>({
  worker: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true
  },
  bookings: [{
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  }],
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  totalEarnings: {
    type: Number,
    required: true,
    min: 0
  },
  commissionPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 15
  },
  commissionAmount: {
    type: Number,
    required: true,
    min: 0
  },
  netPayout: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'cash'],
    required: true,
    default: 'bank_transfer'
  },
  accountDetails: {
    accountHolderName: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    ifscCode: {
      type: String,
      trim: true,
      uppercase: true
    },
    upiId: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  payoutStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  transactionReference: {
    type: String,
    trim: true
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  processingDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  failureReason: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    maxlength: 500,
    trim: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
PayoutSchema.index({ worker: 1, payoutStatus: 1 });
PayoutSchema.index({ periodStart: 1, periodEnd: 1 });
PayoutSchema.index({ createdAt: -1 });

// Calculate commission and net payout before saving
PayoutSchema.pre('save', function(next) {
  if (this.isModified('totalEarnings') || this.isModified('commissionPercent')) {
    this.commissionAmount = (this.totalEarnings * this.commissionPercent) / 100;
    this.netPayout = this.totalEarnings - this.commissionAmount;
  }
  next();
});

export default mongoose.model<IPayout>('Payout', PayoutSchema);
