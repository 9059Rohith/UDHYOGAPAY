import mongoose, { Document, Schema } from 'mongoose';

export type PromotionDiscountType = 'flat' | 'percentage';

export interface IPromotion extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  usageLimit: number;
  usedCount: number;
  validUntil: Date;
  discountType: PromotionDiscountType;
  discountValue: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    usageLimit: {
      type: Number,
      required: true,
      min: 1
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    validUntil: {
      type: Date,
      required: true
    },
    discountType: {
      type: String,
      enum: ['flat', 'percentage'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
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

promotionSchema.index({ code: 1 }, { unique: true });
promotionSchema.index({ isActive: 1, validUntil: 1 });

export default mongoose.model<IPromotion>('Promotion', promotionSchema);
