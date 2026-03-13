// UI component: renders and manages the ActiveBooking feature block.
import React, { useState } from 'react';
import { Chat } from '../common/Chat';
import { bookingService } from '../../services/chatService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Alert } from '../common/Alert';
import PaymentModal from '../common/PaymentModal';

interface Booking {
  _id: string;
  worker: {
    _id: string;
    userId: { name: string; phone: string };
    profession: string;
    rating: number;
  };
  status: string;
  otp: string;
  pricing: number;
  location: { address: string; coordinates: [number, number] };
  paymentStatus: string;
  timeline: {
    requested?: string;
    accepted?: string;
    started?: string;
    completed?: string;
  };
}

interface ActiveBookingProps {
  booking: Booking;
  onUpdate: () => void;
}

export const UserActiveBooking: React.FC<ActiveBookingProps> = ({ booking, onUpdate }) => {
  const [showChat, setShowChat] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handlePaymentSuccess = () => {
    setAlert({ type: 'success', message: 'Payment successful! Please rate your experience.' });
    setShowReview(true);
    onUpdate();
  };

  const handleSubmitReview = async () => {
    setLoading(true);
    try {
      await bookingService.rateWorker(booking._id, rating, feedback);
      setAlert({ type: 'success', message: 'Thank you for your feedback!' });
      setTimeout(() => {
        onUpdate();
      }, 2000);
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to submit review' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-purple-100 text-purple-700';
      case 'started': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">🚀 Active Booking</h2>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(booking.status)}`}>
              {booking.status.toUpperCase()}
            </span>
            {booking.paymentStatus === 'pending' && booking.status === 'completed' && (
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700">
                ⏳ PAYMENT PENDING
              </span>
            )}
          </div>
        </div>

        {alert && (
          <div className="p-4">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Left Column - Booking Details */}
            <div className="space-y-4">
              {/* Worker Info */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">👷</span> Worker Details
                </h3>
                <div className="space-y-2">
                  <p className="text-lg font-bold text-gray-900">{booking.worker?.userId?.name}</p>
                  <p className="text-sm text-gray-600">📞 {booking.worker?.userId?.phone}</p>
                  <p className="text-sm text-gray-600 capitalize">🛠️ {booking.worker?.profession}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-bold">{booking.worker?.rating?.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* OTP */}
              {booking.otp && booking.status !== 'completed' && (
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200">
                  <p className="text-sm text-gray-600 mb-2">🔐 Share this OTP with worker to complete:</p>
                  <p className="text-4xl font-bold text-orange-600 text-center tracking-wider">{booking.otp}</p>
                </div>
              )}

              {/* Pricing */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-2">💰 Total Amount</p>
                <p className="text-3xl font-bold text-green-600">₹{booking.pricing}</p>
              </div>

              {/* Location */}
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-2">📍 Service Location</p>
                <p className="text-sm text-gray-800 mb-3">{booking.location?.address || 'Location'}</p>
                <a
                  href={`https://www.google.com/maps?q=${booking.location?.coordinates[1]},${booking.location?.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-all w-full"
                >
                  🗺️ View Location on Map
                </a>
              </div>
            </div>

            {/* Right Column - Actions & Chat */}
            <div className="space-y-4">
              {/* Status Timeline */}
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3">📅 Timeline</h3>
                <div className="space-y-2">
                  {booking.timeline?.requested && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Requested:</span>
                      <span className="font-semibold">{new Date(booking.timeline.requested).toLocaleString()}</span>
                    </div>
                  )}
                  {booking.timeline?.accepted && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Accepted:</span>
                      <span className="font-semibold">{new Date(booking.timeline.accepted).toLocaleString()}</span>
                    </div>
                  )}
                  {booking.timeline?.started && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Started:</span>
                      <span className="font-semibold">{new Date(booking.timeline.started).toLocaleString()}</span>
                    </div>
                  )}
                  {booking.timeline?.completed && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-semibold">{new Date(booking.timeline.completed).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Section */}
              {booking.status === 'completed' && booking.paymentStatus === 'pending' && !showReview && (
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl border-2 border-green-300">
                  <h3 className="font-bold text-gray-800 mb-3">💳 Make Payment</h3>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full py-4 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:via-blue-600 hover:to-purple-600 shadow-lg transform hover:scale-105 transition-all"
                  >
                    💳 Proceed to Payment
                  </button>
                </div>
              )}

              {/* Review Section */}
              {showReview && booking.paymentStatus === 'paid' && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-300">
                  <h3 className="font-bold text-gray-800 mb-3">⭐ Rate Your Experience</h3>
                  <div className="flex gap-2 mb-3 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-4xl transition-transform hover:scale-125 ${
                          star <= rating ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share your experience (optional)"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 mb-3"
                    rows={3}
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50"
                  >
                    {loading ? <LoadingSpinner /> : 'Submit Review'}
                  </button>
                </div>
              )}

              {/* Chat Button */}
              {booking.status !== 'pending' && (
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 shadow-lg transform hover:scale-105 transition-all"
                >
                  💬 {showChat ? 'Hide Chat' : 'Chat with Worker'}
                </button>
              )}
            </div>
          </div>

          {/* Chat Section */}
          {showChat && booking.status !== 'pending' && (
            <div className="h-96 border-t">
              <Chat bookingId={booking._id} currentUserRole="user" />
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <PaymentModal
            booking={booking}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
};
