import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  worker: mongoose.Types.ObjectId;
  rating: number;
  reviewTitle: string;
  reviewComment: string;
  goodAttributes?: string;
  whatToImprove?: string;
  serviceQuality: number;
  punctuality: number;
  cleanliness: number;
  wouldRecommend: boolean;
  status: 'pending' | 'approved' | 'rejected';
  moderatedBy?: mongoose.Types.ObjectId;
  moderationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  worker: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  reviewTitle: {
    type: String,
    required: [true, 'Please provide a review title'],
    maxlength: 100,
    trim: true
  },
  reviewComment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: 500,
    trim: true
  },
  goodAttributes: {
    type: String,
    maxlength: 300,
    trim: true
  },
  whatToImprove: {
    type: String,
    maxlength: 300,
    trim: true
  },
  serviceQuality: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  },
  punctuality: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  },
  cleanliness: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderationNotes: {
    type: String,
    maxlength: 300
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
ReviewSchema.index({ worker: 1, status: 1 });
ReviewSchema.index({ user: 1, createdAt: -1 });

// Update worker's average rating after review is approved
ReviewSchema.post('save', async function(doc) {
  if (doc.status === 'approved') {
    const Worker = mongoose.model('Worker');
    const Review = mongoose.model('Review');
    
    const stats = await Review.aggregate([
      { $match: { worker: doc.worker, status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    if (stats.length > 0) {
      await Worker.findByIdAndUpdate(doc.worker, {
        rating: Math.round(stats[0].avgRating * 10) / 10
      });
    }
  }
});

export default mongoose.model<IReview>('Review', ReviewSchema);
