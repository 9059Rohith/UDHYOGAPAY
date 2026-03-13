import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

export interface CreateOrderOptions {
  amount: number; // Amount in paise (1 INR = 100 paise)
  currency?: string;
  receipt: string;
  notes?: any;
}

export interface VerifyPaymentOptions {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

class RazorpayService {
  /**
   * Create Razorpay order
   */
  async createOrder(options: CreateOrderOptions) {
    try {
      const order = await razorpay.orders.create({
        amount: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt,
        notes: options.notes || {}
      });

      return {
        success: true,
        order
      };
    } catch (error: any) {
      console.error('Razorpay Order Creation Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyPaymentSignature(options: VerifyPaymentOptions): boolean {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = options;

      // Generate signature
      const text = `${razorpayOrderId}|${razorpayPaymentId}`;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(text)
        .digest('hex');

      // Compare signatures
      return generated_signature === razorpaySignature;
    } catch (error) {
      console.error('Payment Verification Error:', error);
      return false;
    }
  }

  /**
   * Fetch payment details
   */
  async getPaymentDetails(paymentId: string) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return {
        success: true,
        payment
      };
    } catch (error: any) {
      console.error('Fetch Payment Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount?: number) {
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount // If not provided, full refund
      });

      return {
        success: true,
        refund
      };
    } catch (error: any) {
      console.error('Refund Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Capture payment (for authorized payments)
   */
  async capturePayment(paymentId: string, amount: number) {
    try {
      const payment = await razorpay.payments.capture(paymentId, amount, 'INR');
      return {
        success: true,
        payment
      };
    } catch (error: any) {
      console.error('Capture Payment Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new RazorpayService();
