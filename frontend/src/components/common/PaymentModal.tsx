// UI component: renders and manages the PaymentModal feature block.
import React, { useState } from 'react';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ booking, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [loading, setLoading] = useState(false);

  const handleOnlinePayment = async () => {
    setLoading(true);
    try {
      // Create Razorpay order
      const orderResponse = await paymentService.createOrder(booking._id);

      if (!orderResponse.success) {
        throw new Error('Failed to create payment order');
      }

      // Initialize Razorpay payment
      await paymentService.initializePayment(
        orderResponse.data,
        async (paymentResponse) => {
          try {
            // Verify payment on backend
            const verifyResponse = await paymentService.verifyPayment(paymentResponse);

            if (verifyResponse.success) {
              toast.success('Payment successful!');
              onSuccess();
              onClose();
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          toast.error(error.message || 'Payment failed');
          setLoading(false);
        }
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    setLoading(true);
    try {
      const response = await paymentService.recordCashPayment(booking._id);

      if (response.success) {
        toast.success('Cash payment recorded successfully!');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record cash payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'online') {
      handleOnlinePayment();
    } else {
      handleCashPayment();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Booking Details */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Booking Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Service:</span> {booking.serviceType}</p>
              <p><span className="font-medium">Worker:</span> {booking.worker?.userId?.name}</p>
              <p><span className="font-medium">Amount:</span> ₹{booking.pricing}</p>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Select Payment Method</h3>
            <div className="space-y-3">
              {/* Online Payment */}
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'online'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'online')}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">Online Payment</span>
                    <div className="flex items-center space-x-2">
                      <img src="/cards.png" alt="Cards" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
                      <span className="text-xs text-gray-500">UPI, Cards, Net Banking</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Secure payment via Razorpay</p>
                </div>
              </label>

              {/* Cash Payment */}
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">Cash Payment</span>
                    <span className="text-2xl">💵</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Pay directly to the worker</p>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Info */}
          {paymentMethod === 'cash' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Please confirm that you have paid the worker directly before proceeding.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-left">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-2xl font-bold text-gray-800">₹{booking.pricing}</p>
          </div>
          <div className="space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Pay ₹${booking.pricing}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
