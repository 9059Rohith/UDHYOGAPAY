// Service layer: handles chatService API calls and request logic.
import api from './api';

export const chatService = {
  // Get all messages for a booking
  getMessages: async (bookingId: string) => {
    const response = await api.get(`/chat/${bookingId}`);
    return response.data;
  },

  // Send a message
  sendMessage: async (bookingId: string, message: string, type: string = 'text') => {
    const response = await api.post(`/chat/${bookingId}`, { message, type });
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (bookingId: string) => {
    const response = await api.patch(`/chat/${bookingId}/read`);
    return response.data;
  }
};

export const bookingService = {
  // Get active booking for user
  getUserActiveBooking: async () => {
    const response = await api.get('/bookings/active/user');
    return response.data;
  },

  // Get active booking for worker
  getWorkerActiveBooking: async () => {
    const response = await api.get('/bookings/active/worker');
    return response.data;
  },

  // Start work
  startWork: async (bookingId: string) => {
    const response = await api.patch(`/bookings/${bookingId}/start`);
    return response.data;
  },

  // Complete work
  completeWork: async (bookingId: string, otp: string) => {
    const response = await api.patch(`/bookings/${bookingId}/complete`, { otp });
    return response.data;
  },

  // Make payment
  makePayment: async (bookingId: string, paymentMethod: string = 'cash') => {
    const response = await api.patch(`/bookings/${bookingId}/payment`, { paymentMethod });
    return response.data;
  },

  // Confirm payment received (worker)
  confirmPayment: async (bookingId: string) => {
    const response = await api.patch(`/bookings/${bookingId}/confirm-payment`);
    return response.data;
  },

  // Rate worker
  rateWorker: async (bookingId: string, rating: number, feedback: string) => {
    const response = await api.patch(`/bookings/${bookingId}/rate`, { rating, feedback });
    return response.data;
  }
};
