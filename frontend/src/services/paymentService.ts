import api from './api';

export interface CreateOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    amount: number;
    currency: string;
    transactionId: string;
    razorpayKeyId: string;
    bookingDetails: {
      id: string;
      serviceType: string;
      workerName: string;
    };
  };
}

export interface VerifyPaymentData {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  bookingId: string;
}

export interface TransactionHistory {
  transactions: any[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

const paymentService = {
  /**
   * Create Razorpay order for booking payment
   */
  createOrder: async (bookingId: string): Promise<CreateOrderResponse> => {
    const response = await api.post('/payments/create-order', { bookingId });
    return response.data;
  },

  /**
   * Verify Razorpay payment
   */
  verifyPayment: async (data: VerifyPaymentData) => {
    const response = await api.post('/payments/verify', data);
    return response.data;
  },

  /**
   * Record cash payment
   */
  recordCashPayment: async (bookingId: string) => {
    const response = await api.post('/payments/cash', { bookingId });
    return response.data;
  },

  /**
   * Get transaction history
   */
  getTransactionHistory: async (page: number = 1, status?: string): Promise<TransactionHistory> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (status) params.append('status', status);

    const response = await api.get(`/payments/history?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Request refund (admin only)
   */
  requestRefund: async (transactionId: string, reason: string, amount?: number) => {
    const response = await api.post('/payments/refund', {
      transactionId,
      reason,
      amount
    });
    return response.data;
  },

  /**
   * Load Razorpay script
   */
  loadRazorpayScript: (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  /**
   * Initialize Razorpay payment
   */
  initializePayment: async (
    orderData: CreateOrderResponse['data'],
    onSuccess: (response: any) => void,
    onFailure: (error: any) => void
  ) => {
    const isLoaded = await paymentService.loadRazorpayScript();

    if (!isLoaded) {
      onFailure({ message: 'Failed to load payment gateway' });
      return;
    }

    const options = {
      key: orderData.razorpayKeyId,
      amount: orderData.amount * 100, // Convert to paise
      currency: orderData.currency,
      name: 'Udhyoga Pay',
      description: `Payment for ${orderData.bookingDetails.serviceType}`,
      order_id: orderData.orderId,
      handler: function (response: any) {
        onSuccess({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          bookingId: orderData.bookingDetails.id
        });
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      notes: {
        bookingId: orderData.bookingDetails.id,
        serviceType: orderData.bookingDetails.serviceType
      },
      theme: {
        color: '#3B82F6'
      },
      modal: {
        ondismiss: function () {
          onFailure({ message: 'Payment cancelled by user' });
        }
      }
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  }
};

export default paymentService;
