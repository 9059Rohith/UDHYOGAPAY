import mongoose, { Document, Schema } from 'mongoose';

export interface IDeletionLog extends Document {
  deletedUserId: mongoose.Types.ObjectId;
  accountHolderName: string;
  email: string;
  role: 'user' | 'worker' | 'admin';
  reason: string;
  deletedBy: mongoose.Types.ObjectId;
  deletedAt: Date;
  additionalInfo?: string;
}

const DeletionLogSchema = new Schema<IDeletionLog>(
  {
    deletedUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },
    accountHolderName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'worker', 'admin'],
      required: true
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for deletion'],
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deletedAt: {
      type: Date,
      default: Date.now
    },
    additionalInfo: {
      type: String,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

// Index for audit trails
DeletionLogSchema.index({ deletedBy: 1, deletedAt: -1 });
DeletionLogSchema.index({ email: 1 });
DeletionLogSchema.index({ deletedAt: -1 });

export default mongoose.model<IDeletionLog>('DeletionLog', DeletionLogSchema);
