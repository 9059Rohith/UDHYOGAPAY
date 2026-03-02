import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

// Base configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token from storage
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    // Handle errors
    if (error.response) {
      const status = error.response.status;
      
      // Token expired or unauthorized
      if (status === 401) {
        clearAuthToken();
        // Redirect to login (platform-specific implementation needed)
        handleUnauthorized();
      }
      
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `[API Error] ${error.config?.url}`,
          error.response.data
        );
      }
    } else if (error.request) {
      // Network error
      console.error('[Network Error]', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Platform-agnostic token management
// These functions should be implemented per platform:
// Web: localStorage
// Mobile: SecureStore
function getAuthToken(): string | null {
  // Platform-specific implementation
  return null;
}

function clearAuthToken(): void {
  // Platform-specific implementation
}

function handleUnauthorized(): void {
  // Platform-specific implementation
}

export default api;

// API Endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) =>
    api.post('/auth/register', userData),
  logout: () =>
    api.post('/auth/logout'),
  refreshToken: () =>
    api.post('/auth/refresh'),
};

export const userAPI = {
  getProfile: () =>
    api.get('/users/profile'),
  updateProfile: (data: any) =>
    api.put('/users/profile', data),
  uploadAvatar: (formData: FormData) =>
    api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const bookingAPI = {
  getAll: (params?: any) =>
    api.get('/bookings', { params }),
  getById: (id: string) =>
    api.get(`/bookings/${id}`),
  create: (data: any) =>
    api.post('/bookings', data),
  update: (id: string, data: any) =>
    api.put(`/bookings/${id}`, data),
  cancel: (id: string, reason: string) =>
    api.post(`/bookings/${id}/cancel`, { reason }),
};

export const workerAPI = {
  getAll: (params?: any) =>
    api.get('/workers', { params }),
  getById: (id: string) =>
    api.get(`/workers/${id}`),
  getNearby: (lat: number, lng: number, radius: number) =>
    api.get('/workers/nearby', { params: { lat, lng, radius } }),
  getAvailability: (id: string, date: string) =>
    api.get(`/workers/${id}/availability`, { params: { date } }),
};

export const reviewAPI = {
  getByWorker: (workerId: string) =>
    api.get(`/reviews/worker/${workerId}`),
  create: (data: any) =>
    api.post('/reviews', data),
};

export const notificationAPI = {
  getAll: () =>
    api.get('/notifications'),
  markAsRead: (id: string) =>
    api.put(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.put('/notifications/read-all'),
};
