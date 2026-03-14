export type DiscountType = 'flat' | 'percentage';

export interface Promotion {
  _id: string;
  code: string;
  usageLimit: number;
  usedCount: number;
  validUntil: string;
  discountType: DiscountType;
  discountValue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionPayload {
  code: string;
  usageLimit: number;
  validUntil: string;
  discountType: DiscountType;
  discountValue: number;
  isActive?: boolean;
}

export interface UpdatePromotionPayload extends Partial<CreatePromotionPayload> {}

export interface ValidatePromotionPayload {
  code: string;
  bookingAmount: number;
}

export interface ValidatePromotionResult {
  promotion: Promotion;
  bookingAmount: number;
  discountAmount: number;
  finalAmount: number;
}
