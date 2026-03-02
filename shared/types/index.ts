// Shared Types between Web and Mobile
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'worker' | 'admin';
  profilePicture?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Worker extends User {
  workerId: string;
  profession: string;
  experience: number;
  hourlyRate: number;
  rating: number;
  totalBookings: number;
  availability: 'online' | 'offline' | 'busy';
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  skills: string[];
  documents: {
    type: string;
    url: string;
    verified: boolean;
  }[];
}

export interface Booking {
  _id: string;
  user: User;
  worker: Worker;
  serviceCategory: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  location: {
    address: string;
    coordinates: [number, number];
  };
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  booking: string;
  user: User;
  worker: Worker;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  data?: any;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
