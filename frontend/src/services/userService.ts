// Service layer: handles userService API calls and request logic.
import api from './api';
import type { ApiResponse, User, UserProfile } from '../types';

/**
 * User Service
 */
export const userService = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<UserProfile>>('/users/profile');
    return response.data.data!;
  },

  /**
   * Update profile
   */
  updateProfile: async (data: any): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/users/profile', data);
    return response.data.data!;
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (formData: FormData): Promise<{ avatar: string }> => {
    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  /**
   * Get favorites
   */
  getFavorites: async (): Promise<string[]> => {
    const response = await api.get('/users/favorites');
    return response.data.data;
  },

  /**
   * Add to favorites
   */
  addFavorite: async (workerId: string): Promise<void> => {
    await api.post('/users/favorites', { workerId });
  },

  /**
   * Remove from favorites
   */
  removeFavorite: async (workerId: string): Promise<void> => {
    await api.delete(`/users/favorites/${workerId}`);
  },

  /**
   * Get notifications
   */
  getNotifications: async () => {
    const response = await api.get('/users/notifications');
    return response.data.data;
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: async (notificationId: string): Promise<void> => {
    await api.put(`/users/notifications/${notificationId}/read`);
  },

  /**
   * Get settings
   */
  getSettings: async () => {
    const response = await api.get('/users/settings');
    return response.data.data;
  },

  /**
   * Update settings
   */
  updateSettings: async (settings: any): Promise<void> => {
    await api.put('/users/settings', settings);
  },

  /**
   * Delete account
   */
  deleteAccount: async (): Promise<void> => {
    await api.delete('/users/account');
  },
};

export default userService;
