// Service layer: handles bookingService API calls and request logic.
import api from './api';
import type { ApiResponse, Booking, BookingRequest, BookingStats, PaginatedResponse } from '../types';

/**
 * Booking Service
 */
export const bookingService = {
  /**
   * Get all bookings
   */
  getAll: async (params?: any): Promise<PaginatedResponse<Booking>> => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  /**
   * Get booking by ID
   */
  getById: async (id: string): Promise<Booking> => {
    const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data.data!;
  },

  /**
   * Create booking
   */
  create: async (data: BookingRequest): Promise<Booking> => {
    const response = await api.post<ApiResponse<Booking>>('/bookings', data);
    return response.data.data!;
  },

  /**
   * Update booking
   */
  update: async (id: string, data: any): Promise<Booking> => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}`, data);
    return response.data.data!;
  },

  /**
   * Confirm booking (worker)
   */
  confirm: async (id: string): Promise<Booking> => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}/confirm`);
    return response.data.data!;
  },

  /**
   * Accept booking (worker)
   */
  accept: async (id: string): Promise<Booking> => {
    const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/accept`);
    return response.data.data!;
  },

  /**
   * Reject booking (worker)
   */
  reject: async (id: string, reason: string): Promise<Booking> => {
    const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/reject`, { reason });
    return response.data.data!;
  },

  /**
   * Cancel booking
   */
  cancel: async (id: string, reason: string): Promise<Booking> => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
    return response.data.data!;
  },

  /**
   * Start job (worker)
   */
  startJob: async (id: string): Promise<Booking> => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}/start`);
    return response.data.data!;
  },

  /**
   * Complete job (verify OTP)
   */
  completeJob: async (id: string, otp: string): Promise<Booking> => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}/complete`, { otp });
    return response.data.data!;
  },

  /**
   * Rate booking
   */
  rate: async (id: string, rating: number, review?: string): Promise<Booking> => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}/rate`, { rating, review });
    return response.data.data!;
  },

  /**
   * Get booking stats
   */
  getStats: async (): Promise<BookingStats> => {
    const response = await api.get<ApiResponse<BookingStats>>('/bookings/stats');
    return response.data.data!;
  },

  /**
   * Get user bookings
   */
  getUserBookings: async (params?: any): Promise<Booking[]> => {
    const response = await api.get('/bookings/user', { params });
    return response.data.data;
  },

  /**
   * Get worker bookings
   */
  getWorkerBookings: async (params?: any): Promise<any> => {
    const response = await api.get('/bookings/worker/history', { params });
    return response.data;
  },

  /**
   * Get active booking
   */
  getActiveBooking: async (): Promise<Booking | null> => {
    const response = await api.get('/bookings/active');
    return response.data.data;
  },

  /**
   * Delete booking
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/bookings/${id}`);
  },
};

export default bookingService;
