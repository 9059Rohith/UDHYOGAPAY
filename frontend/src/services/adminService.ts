// Service layer: handles adminService API calls and request logic.
import api from './api';

/**
 * Admin Service
 */
export const adminService = {
  /**
   * Get dashboard stats
   */
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data.data;
  },

  /**
   * Get pending worker verifications
   */
  getPendingVerifications: async () => {
    const response = await api.get('/admin/workers/pending');
    return response.data.data;
  },

  /**
   * Approve worker
   */
  approveWorker: async (workerId: string): Promise<void> => {
    await api.put(`/admin/workers/${workerId}/approve`);
  },

  /**
   * Reject worker
   */
  rejectWorker: async (workerId: string, reason: string): Promise<void> => {
    await api.put(`/admin/workers/${workerId}/reject`, { reason });
  },

  /**
   * Get all users
   */
  getUsers: async (params?: any) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Get all workers
   */
  getWorkers: async (params?: any) => {
    const response = await api.get('/admin/workers', { params });
    return response.data;
  },

  /**
   * Get all bookings
   */
  getBookings: async (params?: any) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },

  /**
   * Get user details
   */
  getUserDetails: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  /**
   * Get worker details
   */
  getWorkerDetails: async (workerId: string) => {
    const response = await api.get(`/admin/workers/${workerId}`);
    return response.data.data;
  },

  /**
   * Block user
   */
  blockUser: async (userId: string): Promise<void> => {
    await api.put(`/admin/users/${userId}/block`);
  },

  /**
   * Unblock user
   */
  unblockUser: async (userId: string): Promise<void> => {
    await api.put(`/admin/users/${userId}/unblock`);
  },

  /**
   * Get analytics data
   */
  getAnalytics: async (period: 'week' | 'month' | 'year') => {
    const response = await api.get('/admin/analytics', { params: { period } });
    return response.data.data;
  },

  /**
   * Get activity logs
   */
  getActivityLogs: async (params?: any) => {
    const response = await api.get('/admin/logs', { params });
    return response.data;
  },

  /**
   * Generate report
   */
  generateReport: async (type: string, params?: any) => {
    const response = await api.post('/admin/reports', { type, ...params });
    return response.data.data;
  },

  /**
   * Export data
   */
  exportData: async (type: string, format: 'csv' | 'excel') => {
    const response = await api.get(`/admin/export/${type}`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Approve worker KYC
   */
  approveWorkerKYC: async (workerId: string): Promise<void> => {
    await api.patch(`/admin/workers/${workerId}/kyc/approve`);
  },

  /**
   * Reject worker KYC
   */
  rejectWorkerKYC: async (workerId: string, reason: string): Promise<void> => {
    await api.patch(`/admin/workers/${workerId}/kyc/reject`, { reason });
  },

  /**
   * Delete worker from system
   */
  deleteWorker: async (workerId: string): Promise<void> => {
    await api.delete(`/admin/workers/${workerId}`);
  },
};

export default adminService;
