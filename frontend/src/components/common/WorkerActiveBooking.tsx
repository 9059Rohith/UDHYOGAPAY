// UI component: renders and manages the WorkerActiveBooking feature block.
import React, { useState } from 'react';
import { Chat } from '../common/Chat';
import { bookingService } from '../../services/chatService';
import { bookingService as mainBookingService } from '../../services/bookingService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Alert } from '../common/Alert';

interface Booking {
  _id: string;
  user: { _id: string; name: string; phone: string; email: string };
  status: string;
  otp: string;
  pricing: number;
  profession: string;
  location: { address: string; coordinates: [number, number] };
  paymentStatus: string;
  timeline: {
    requested?: string;
    accepted?: string;
    started?: string;
    completed?: string;
  };
  estimatedDistance: number;
  estimatedTime: number;
}

interface WorkerActiveBookingProps {
  booking: Booking;
  onUpdate: () => void;
}

export const WorkerActiveBooking: React.FC<WorkerActiveBookingProps> = ({ booking, onUpdate }) => {
  const [showChat, setShowChat] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAcceptBooking = async () => {
    setLoading(true);
    try {
      await mainBookingService.accept(booking._id);
      setAlert({ type: 'success', message: 'Booking accepted! Navigate to customer location.' });
      setTimeout(() => onUpdate(), 1500);
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to accept booking' });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectBooking = async () => {
    const reason = prompt('Why are you rejecting this booking?');
    if (!reason) return;

    setLoading(true);
    try {
      await mainBookingService.reject(booking._id, reason);
      setAlert({ type: 'success', message: 'Booking rejected successfully.' });
      setTimeout(() => onUpdate(), 1500);
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to reject booking' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async () => {
    setLoading(true);
    try {
      await bookingService.startWork(booking._id);
      setAlert({ type: 'success', message: 'Work started! Customer has been notified.' });
      onUpdate();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to start work' });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWork = async () => {
    if (!otpInput.trim()) {
      setAlert({ type: 'error', message: 'Please enter the OTP from customer' });
      return;
    }

    setLoading(true);
    try {
      await bookingService.completeWork(booking._id, otpInput);
      setAlert({ type: 'success', message: 'Work completed! Waiting for customer payment.' });
      setOtpInput('');
      onUpdate();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Invalid OTP or failed to complete' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    const confirmAction = window.confirm('Have you received the payment from the customer?');
    if (!confirmAction) return;

    setLoading(true);
    try {
      await bookingService.confirmPayment(booking._id);
      setAlert({ type: 'success', message: 'Payment confirmed! Job completed successfully.' });
      setTimeout(() => onUpdate(), 1500);
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to confirm payment' });
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
    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
        <h2 className="text-2xl font-bold mb-2">🔧 Active Job</h2>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(booking.status)}`}>
            {booking.status.toUpperCase()}
          </span>
          {booking.paymentStatus === 'pending' && booking.status === 'completed' && (
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700">
              ⏳ AWAITING PAYMENT
            </span>
          )}
          {booking.paymentStatus === 'paid' && (
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
              ✅ PAID
            </span>
          )}
        </div>
      </div>

      {alert && (
        <div className="p-4">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Customer & Job Details */}
          <div className="space-y-4">
            {/* Customer Info */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-2xl">👤</span> Customer Details
              </h3>
              <div className="space-y-2">
                <p className="text-lg font-bold text-gray-900">{booking.user?.name}</p>
                <p className="text-sm text-gray-600">📞 {booking.user?.phone}</p>
                <p className="text-sm text-gray-600">✉️ {booking.user?.email}</p>
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl border-2 border-green-200">
              <h3 className="font-bold text-gray-800 mb-3">🛠️ Job Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-bold capitalize">{booking.profession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-bold">{booking.estimatedDistance?.toFixed(2)} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ETA:</span>
                  <span className="font-bold">~{booking.estimatedTime} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Earning:</span>
                  <span className="font-bold text-green-600 text-xl">₹{booking.pricing}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
              <p className="text-sm text-gray-600 mb-2">📍 Service Location</p>
              <p className="text-sm text-gray-800 mb-3">{booking.location?.address || 'Location'}</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://www.google.com/maps?q=${booking.location?.coordinates[1]},${booking.location?.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-all"
                >
                  🗺️ View on Map
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${booking.location?.coordinates[1]},${booking.location?.coordinates[0]}&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm transition-all"
                >
                  🧭 Navigate
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Status */}
          <div className="space-y-4">
            {/* Timeline */}
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

            {/* Action Buttons */}
            {booking.status === 'pending' && (
              <div className="space-y-3">
                <button
                  onClick={handleAcceptBooking}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 shadow-lg transform hover:scale-105 transition-all"
                >
                  {loading ? <LoadingSpinner /> : '✅ Accept Booking'}
                </button>
                <button
                  onClick={handleRejectBooking}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-red-600 hover:to-pink-600 disabled:opacity-50 shadow-lg transform hover:scale-105 transition-all"
                >
                  {loading ? <LoadingSpinner /> : '❌ Reject Booking'}
                </button>
              </div>
            )}

            {booking.status === 'accepted' && (
              <button
                onClick={handleStartWork}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 shadow-lg transform hover:scale-105 transition-all"
              >
                {loading ? <LoadingSpinner /> : '🚀 Start Work'}
              </button>
            )}

            {booking.status === 'started' && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200">
                <h3 className="font-bold text-gray-800 mb-3">🔐 Complete Work</h3>
                <p className="text-sm text-gray-600 mb-3">Ask customer for OTP to complete:</p>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Enter OTP"
                  maxLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-2xl font-bold text-center tracking-wider mb-3 focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={handleCompleteWork}
                  disabled={loading || !otpInput.trim()}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 shadow-lg"
                >
                  {loading ? <LoadingSpinner /> : '✅ Complete Work'}
                </button>
              </div>
            )}

            {booking.status === 'completed' && booking.paymentStatus === 'pending' && (
              <div className="space-y-3">
                <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-300 text-center">
                  <p className="text-2xl mb-2">⏳</p>
                  <p className="font-bold text-gray-800">Waiting for customer payment...</p>
                  <p className="text-sm text-gray-600 mt-1">Amount: ₹{booking.pricing}</p>
                </div>
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 shadow-lg transform hover:scale-105 transition-all"
                >
                  {loading ? <LoadingSpinner /> : '✅ Payment Done'}
                </button>
              </div>
            )}

            {booking.paymentStatus === 'paid' && (
              <div className="bg-green-50 p-4 rounded-xl border-2 border-green-300 text-center">
                <p className="text-4xl mb-2">🎉</p>
                <p className="font-bold text-green-600 text-lg">Job Completed!</p>
                <p className="text-sm text-gray-600 mt-1">Payment received: ₹{booking.pricing}</p>
              </div>
            )}

            {/* Chat Button */}
            <button
              onClick={() => setShowChat(!showChat)}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 shadow-lg transform hover:scale-105 transition-all"
            >
              💬 {showChat ? 'Hide Chat' : 'Chat with Customer'}
            </button>
          </div>
        </div>

        {/* Chat Section */}
        {showChat && (
          <div className="mt-6 h-96 border-2 border-gray-200 rounded-xl overflow-hidden">
            <Chat bookingId={booking._id} currentUserRole="worker" />
          </div>
        )}
      </div>
    </div>
  );
};
