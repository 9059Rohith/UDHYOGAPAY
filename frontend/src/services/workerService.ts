// Service layer: handles workerService API calls and request logic.
import api from './api';
import type { ApiResponse, Worker, WorkerProfile, WorkerStats, PaginatedResponse } from '../types';

/**
 * Worker Service
 */
export const workerService = {
  /**
   * Get all workers
   */
  getAll: async (params?: any): Promise<PaginatedResponse<Worker>> => {
    const response = await api.get('/workers', { params });
    return response.data;
  },

  /**
   * Get workers near location
   */
  getNearby: async (lat: number, lng: number, profession?: string, maxDistance?: number) => {
    const response = await api.get('/workers/nearby', {
      params: { lat, lng, profession, maxDistance },
    });
    return response.data.data;
  },

  /**
   * Get worker by ID
   */
  getById: async (id: string): Promise<WorkerProfile> => {
    const response = await api.get<ApiResponse<WorkerProfile>>(`/workers/${id}`);
    return response.data.data!;
  },

  /**
   * Create worker profile
   */
  create: async (data: any): Promise<Worker> => {
    const response = await api.post<ApiResponse<Worker>>('/workers', data);
    return response.data.data!;
  },

  /**
   * Update worker profile
   */
  update: async (id: string, data: any): Promise<Worker> => {
    const response = await api.put<ApiResponse<Worker>>(`/workers/${id}`, data);
    return response.data.data!;
  },

  /**
   * Update worker location
   */
  updateLocation: async (lat: number, lng: number): Promise<void> => {
    await api.put('/workers/location', { coordinates: [lng, lat] });
  },

  /**
   * Toggle availability
   */
  toggleAvailability: async (available: boolean): Promise<void> => {
    // Get current location
    let coordinates: [number, number] | undefined;
    
    if (available && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        coordinates = [position.coords.longitude, position.coords.latitude];
        console.log('📍 Location captured:', coordinates);
      } catch (error: any) {
        console.error('Error getting location:', error);
        if (error.code === 1) {
          throw new Error('Location permission denied. Please enable location access in your browser settings.');
        } else if (error.code === 2) {
          throw new Error('Location unavailable. Please check your GPS settings.');
        } else if (error.code === 3) {
          throw new Error('Location request timed out. Please try again.');
        } else {
          throw new Error('Failed to get location. Please enable location services.');
        }
      }
    }

    if (available && !coordinates) {
      throw new Error('Location is required to go online. Please enable location access.');
    }

    const response = await api.patch('/workers/toggle-online', { 
      isOnline: available,
      coordinates 
    });
    
    console.log('✅ Toggle online response:', response.data);
  },

  /**
   * Get current worker's profile
   */
  getProfile: async (): Promise<Worker> => {
    const response = await api.get('/workers/profile');
    return response.data.worker;
  },

  /**
   * Upload KYC documents
   */
  uploadKYC: async (formData: FormData): Promise<void> => {
    await api.post('/workers/kyc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Get worker stats
   */
  getStats: async (): Promise<WorkerStats> => {
    const response = await api.get<ApiResponse<WorkerStats>>('/workers/stats');
    return response.data.data!;
  },

  /**
   * Get worker reviews
   */
  getReviews: async (workerId: string) => {
    const response = await api.get(`/workers/${workerId}/reviews`);
    return response.data.data;
  },

  /**
   * Get earnings
   */
  getEarnings: async (period?: 'week' | 'month' | 'year') => {
    const response = await api.get('/workers/earnings', { params: { period } });
    return response.data.data;
  },

  /**
   * Request withdrawal
   */
  requestWithdrawal: async (amount: number, bankDetails: any) => {
    const response = await api.post('/workers/withdraw', { amount, bankDetails });
    return response.data.data;
  },

  /**
   * Delete worker profile
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/workers/${id}`);
  },
};

export default workerService;
