import api from './api';
import type { ApiResponse } from '../types/api.types';
import type {
  BookingPolicy,
  CreateBookingPolicyPayload,
  UpdateBookingPolicyPayload
} from '../types/policy.types';

export const policyService = {
  getAll: async (): Promise<BookingPolicy[]> => {
    const response = await api.get<ApiResponse<BookingPolicy[]>>('/booking-policies');
    return response.data.data ?? [];
  },

  getById: async (id: string): Promise<BookingPolicy> => {
    const response = await api.get<ApiResponse<BookingPolicy>>(`/booking-policies/${id}`);
    if (!response.data.data) {
      throw new Error('Booking policy not found');
    }
    return response.data.data;
  },

  create: async (payload: CreateBookingPolicyPayload): Promise<BookingPolicy> => {
    const response = await api.post<ApiResponse<BookingPolicy>>('/booking-policies', payload);
    if (!response.data.data) {
      throw new Error('Failed to create booking policy');
    }
    return response.data.data;
  },

  update: async (id: string, payload: UpdateBookingPolicyPayload): Promise<BookingPolicy> => {
    const response = await api.patch<ApiResponse<BookingPolicy>>(`/booking-policies/${id}`, payload);
    if (!response.data.data) {
      throw new Error('Failed to update booking policy');
    }
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/booking-policies/${id}`);
  }
};

export default policyService;
