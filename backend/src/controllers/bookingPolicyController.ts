import { Request, Response } from 'express';
import BookingPolicy, { IBookingPolicy } from '../models/BookingPolicy';

interface BookingPolicyPayload {
  name: string;
  cancellationWindowHours: number;
  refundEligibilityPercentage: number;
  description?: string;
  isActive?: boolean;
}

const toPolicyResponse = (policy: IBookingPolicy) => ({
  _id: policy._id,
  name: policy.name,
  cancellationWindowHours: policy.cancellationWindowHours,
  refundEligibilityPercentage: policy.refundEligibilityPercentage,
  description: policy.description,
  isActive: policy.isActive,
  createdAt: policy.createdAt,
  updatedAt: policy.updatedAt
});

export const createBookingPolicy = async (
  req: Request<unknown, unknown, BookingPolicyPayload>,
  res: Response
) => {
  try {
    const policy = await BookingPolicy.create({
      name: req.body.name,
      cancellationWindowHours: req.body.cancellationWindowHours,
      refundEligibilityPercentage: req.body.refundEligibilityPercentage,
      description: req.body.description ?? '',
      isActive: req.body.isActive ?? true
    });

    return res.status(201).json({
      success: true,
      message: 'Booking policy created successfully',
      data: toPolicyResponse(policy)
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create booking policy';
    return res.status(500).json({ success: false, message });
  }
};

export const getBookingPolicies = async (_req: Request, res: Response) => {
  try {
    const policies = await BookingPolicy.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: policies.map((policy: IBookingPolicy) => toPolicyResponse(policy))
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch booking policies';
    return res.status(500).json({ success: false, message });
  }
};

export const getBookingPolicyById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const policy = await BookingPolicy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Booking policy not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: toPolicyResponse(policy)
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch booking policy';
    return res.status(500).json({ success: false, message });
  }
};

export const updateBookingPolicy = async (
  req: Request<{ id: string }, unknown, Partial<BookingPolicyPayload>>,
  res: Response
) => {
  try {
    const policy = await BookingPolicy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Booking policy not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking policy updated successfully',
      data: toPolicyResponse(policy)
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update booking policy';
    return res.status(500).json({ success: false, message });
  }
};

export const deleteBookingPolicy = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const policy = await BookingPolicy.findByIdAndDelete(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Booking policy not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking policy deleted successfully'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete booking policy';
    return res.status(500).json({ success: false, message });
  }
};
