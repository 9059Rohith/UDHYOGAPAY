import { Request, Response } from 'express';
import Promotion, { IPromotion } from '../models/Promotion';

interface PromotionPayload {
  code: string;
  usageLimit: number;
  validUntil: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  isActive?: boolean;
}

interface PromotionApplyPayload {
  code: string;
  bookingAmount?: number;
}

const toPromotionResponse = (promotion: IPromotion) => ({
  _id: promotion._id,
  code: promotion.code,
  usageLimit: promotion.usageLimit,
  usedCount: promotion.usedCount,
  validUntil: promotion.validUntil,
  discountType: promotion.discountType,
  discountValue: promotion.discountValue,
  isActive: promotion.isActive,
  createdAt: promotion.createdAt,
  updatedAt: promotion.updatedAt
});

export const createPromotion = async (
  req: Request<unknown, unknown, PromotionPayload>,
  res: Response
) => {
  try {
    const payload = req.body;

    const existing = await Promotion.findOne({ code: payload.code.toUpperCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Promotion code already exists'
      });
    }

    const promotion = await Promotion.create({
      code: payload.code,
      usageLimit: payload.usageLimit,
      validUntil: payload.validUntil,
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      isActive: payload.isActive ?? true
    });

    return res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: toPromotionResponse(promotion)
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create promotion';
    return res.status(500).json({ success: false, message });
  }
};

export const getPromotions = async (_req: Request, res: Response) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: promotions.map((promotion: IPromotion) => toPromotionResponse(promotion))
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch promotions';
    return res.status(500).json({ success: false, message });
  }
};

export const getPromotionById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    return res.status(200).json({ success: true, data: toPromotionResponse(promotion) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch promotion';
    return res.status(500).json({ success: false, message });
  }
};

export const updatePromotion = async (
  req: Request<{ id: string }, unknown, Partial<PromotionPayload>>,
  res: Response
) => {
  try {
    const updatePayload = { ...req.body };
    if (updatePayload.code) {
      updatePayload.code = updatePayload.code.toUpperCase().trim();
    }

    const promotion = await Promotion.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Promotion updated successfully',
      data: toPromotionResponse(promotion)
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update promotion';
    return res.status(500).json({ success: false, message });
  }
};

export const deletePromotion = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete promotion';
    return res.status(500).json({ success: false, message });
  }
};

export const validateAndApplyPromotion = async (
  req: Request<unknown, unknown, PromotionApplyPayload>,
  res: Response
) => {
  try {
    const code = req.body.code?.toUpperCase().trim();
    const bookingAmount = Number(req.body.bookingAmount ?? 0);

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promotion code is required'
      });
    }

    if (Number.isNaN(bookingAmount) || bookingAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'bookingAmount must be a valid non-negative number'
      });
    }

    const now = new Date();

    // Atomic promo usage update to avoid race conditions under concurrent requests.
    const promotion = await Promotion.findOneAndUpdate(
      {
        code,
        isActive: true,
        validUntil: { $gte: now },
        $expr: { $lt: ['$usedCount', '$usageLimit'] }
      },
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    if (!promotion) {
      return res.status(400).json({
        success: false,
        message: 'Invalid, expired, inactive, or exhausted promotion code'
      });
    }

    const computedDiscount =
      promotion.discountType === 'percentage'
        ? (bookingAmount * promotion.discountValue) / 100
        : promotion.discountValue;

    const discountAmount = Math.max(0, Math.min(computedDiscount, bookingAmount));
    const finalAmount = Math.max(0, bookingAmount - discountAmount);

    return res.status(200).json({
      success: true,
      message: 'Promotion applied successfully',
      data: {
        promotion: toPromotionResponse(promotion),
        bookingAmount,
        discountAmount,
        finalAmount
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to apply promotion';
    return res.status(500).json({ success: false, message });
  }
};
