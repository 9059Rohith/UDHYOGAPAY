export interface BookingPolicy {
  _id: string;
  name: string;
  cancellationWindowHours: number;
  refundEligibilityPercentage: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPolicyPayload {
  name: string;
  cancellationWindowHours: number;
  refundEligibilityPercentage: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateBookingPolicyPayload extends Partial<CreateBookingPolicyPayload> {}
