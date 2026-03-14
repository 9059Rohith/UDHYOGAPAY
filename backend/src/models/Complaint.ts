// Backend comment: Complaint
import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  complainant: mongoose.Types.ObjectId;
  complainantRole: 'user' | 'worker';
  jobId: mongoose.Types.ObjectId;
  complaintType: 'payment_issue' | 'service_quality' | 'no_show' | 'unprofessional_behavior' | 'other';
  description: string;
  status: 'pending' | 'in_review' | 'resolved' | 'rejected';
  adminNotes?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    complainant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    complainantRole: {
      type: String,
      enum: ['user', 'worker'],
      required: true
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    complaintType: {
      type: String,
      enum: ['payment_issue', 'service_quality', 'no_show', 'unprofessional_behavior', 'other'],
      required: [true, 'Please select a complaint type']
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'resolved', 'rejected'],
      default: 'pending'
    },
    adminNotes: {
      type: String,
      maxlength: 500
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
ComplaintSchema.index({ complainant: 1, status: 1 });
ComplaintSchema.index({ jobId: 1 });
ComplaintSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
