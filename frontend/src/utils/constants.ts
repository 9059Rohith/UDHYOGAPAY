// Utility module: contains helper logic for constants operations.
export const PROFESSIONS = [
  { value: 'plumber', label: 'Plumber', icon: '🔧' },
  { value: 'electrician', label: 'Electrician', icon: '⚡' },
  { value: 'carpenter', label: 'Carpenter', icon: '🪚' },
  { value: 'painter', label: 'Painter', icon: '🎨' },
  { value: 'cleaner', label: 'Cleaner', icon: '🧹' }
] as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  STARTED: 'started',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const WORKER_MARKER_COLORS: Record<string, string> = {
  plumber: 'green',
  electrician: 'yellow',
  carpenter: 'orange',
  painter: 'red',
  cleaner: 'violet'
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE_URL = `${API_URL}/api`;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 28.6139, lng: 77.2090 }, // Delhi
  DEFAULT_ZOOM: 13,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_OTP: '/auth/verify-otp',
  RESEND_OTP: '/auth/resend-otp',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Users
  USER_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  USER_BOOKINGS: '/users/bookings',
  
  // Workers
  WORKERS: '/workers',
  WORKER_PROFILE: '/workers/profile',
  UPDATE_WORKER: '/workers/profile',
  WORKER_AVAILABILITY: '/workers/availability',
  NEARBY_WORKERS: '/workers/nearby',
  UPDATE_LOCATION: '/workers/location',
  
  // Bookings
  BOOKINGS: '/bookings',
  CREATE_BOOKING: '/bookings',
  CANCEL_BOOKING: '/bookings',
  COMPLETE_BOOKING: '/bookings/complete',
  
  // Admin
  ADMIN_STATS: '/admin/stats',
  PENDING_WORKERS: '/admin/pending-workers',
  APPROVE_WORKER: '/admin/approve-worker',
  ALL_USERS: '/admin/users',
  ALL_BOOKINGS: '/admin/bookings',
};

export const APP_NAME = 'Udhyoga Pay';

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LOCATION: 'user_location',
} as const;

export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  AADHAR: /^\d{12}$/,
  PIN_CODE: /^\d{6}$/,
  PINCODE: /^\d{6}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const;
