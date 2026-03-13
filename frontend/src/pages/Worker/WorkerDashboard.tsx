// Page feature: drives the WorkerDashboard screen and its user interactions.
import React, { useState, useEffect } from 'react';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import { Navbar } from '../../components/common/Navbar';
import { LeafletMap } from '../../components/map/LeafletMap';
import { WorkerActiveBooking } from '../../components/common/WorkerActiveBooking';
import socketService from '../../services/socketService';
import api from '../../services/api';
import { bookingService } from '../../services/chatService';
import { Worker } from '../../types/worker';
import { BookingRequest } from '../../types/booking';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { useGeolocation } from '../../hooks/useGeolocation';

const WorkerDashboard: React.FC = () => {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [incomingBooking, setIncomingBooking] = useState<BookingRequest | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [checkingBooking, setCheckingBooking] = useState(true);
  const { location } = useGeolocation();

  // Auto-track location when online
  useLocationTracking(worker?._id || '', isOnline);

  useEffect(() => {
    fetchWorkerProfile();
    checkActiveBooking();
    setupSocketListeners();

    return () => {
      socketService.off('booking:request');
      socketService.off('booking:completed');
    };
  }, []);

  useEffect(() => {
    if (incomingBooking) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleReject(incomingBooking.bookingId);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCountdown(30);
    }
  }, [incomingBooking]);

  const fetchWorkerProfile = async () => {
    try {
      const response = await api.get('/workers/profile');
      setWorker(response.data.worker);
      setIsOnline(response.data.worker.isOnline);

      if (response.data.worker._id) {
        socketService.joinWorkerRoom(response.data.worker._id);
      }
    } catch (err) {
      console.error('Failed to fetch worker profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkActiveBooking = async () => {
    try {
      const data = await bookingService.getWorkerActiveBooking();
      if (data.booking) {
        setActiveBooking(data.booking);
      }
    } catch (error) {
      console.error('Failed to check active booking:', error);
    } finally {
      setCheckingBooking(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.on('booking:request', (booking: BookingRequest) => {
      setIncomingBooking(booking);

      // Play notification sound
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Booking Request!', {
          body: `${booking.profession} job - ${booking.distance.toFixed(2)} km away`,
          icon: '/logo.png'
        });
      }
    });

    socketService.on('booking:completed', () => {
      fetchWorkerProfile();
    });
  };

  const toggleAvailability = async () => {
    try {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Get current location when going online
      let coordinates = undefined;
      if (!isOnline && location) {
        coordinates = [location.longitude, location.latitude];
      }

      const response = await api.patch('/workers/toggle-online', {
        isOnline: !isOnline,
        coordinates
      });

      setIsOnline(response.data.isOnline);
      
      if (response.data.isOnline) {
        setAlert({
          type: 'success',
          message: '🟢 You are now online and visible to customers!'
        });
      }
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to toggle availability'
      });
    }
  };

  const handleAccept = async (bookingId: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/accept`);
      setIncomingBooking(null);
      checkActiveBooking();
      setAlert({
        type: 'success',
        message: 'Booking accepted! Customer details loaded.'
      });
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to accept booking'
      });
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/reject`);
      setIncomingBooking(null);
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to reject booking'
      });
    }
  };

  if (loading || checkingBooking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" message="Loading dashboard..." />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Worker Profile Not Found</h2>
          <p className="text-gray-600">Please complete your KYC verification.</p>
        </div>
      </div>
    );
  }

  // Show active booking if one exists
  if (activeBooking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16">
          <WorkerActiveBooking 
            booking={activeBooking} 
            onUpdate={checkActiveBooking}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16 p-6">
        {alert && (
          <div className="max-w-4xl mx-auto mb-4">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}
        
        {/* View Toggle */}
        <div className="max-w-4xl mx-auto mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setShowMap(false)}
              className={`flex-1 py-3 px-6 font-bold rounded-lg transition-all ${
                !showMap
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setShowMap(true)}
              className={`flex-1 py-3 px-6 font-bold rounded-lg transition-all ${
                showMap
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              🗺️ Map View
            </button>
          </div>
        </div>

        {/* Map View */}
        {showMap && location ? (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ height: '80vh' }}>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                <h2 className="text-2xl font-bold">📍 Your Live Location</h2>
                <p className="text-sm opacity-90">
                  {isOnline ? '🟢 You are online and visible to customers' : '🔴 You are offline'}
                </p>
              </div>
              <div style={{ height: 'calc(80vh - 80px)' }}>
                <LeafletMap
                  center={[location.latitude, location.longitude]}
                  zoom={15}
                  workers={[]}
                  userLocation={[location.latitude, location.longitude]}
                  height="100%"
                />
              </div>
              {incomingBooking && (
                <div className="absolute top-24 left-4 right-4 z-[1000] bg-white p-6 rounded-xl shadow-2xl border-4 border-blue-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-blue-600">🔔 New Booking Request!</h3>
                    <div className="text-3xl font-bold text-red-600">{countdown}s</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Service</p>
                      <p className="font-bold capitalize">{incomingBooking.profession}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Distance</p>
                      <p className="font-bold">{incomingBooking.distance.toFixed(2)} km</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">ETA</p>
                      <p className="font-bold">~{incomingBooking.estimatedTime} mins</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Earning</p>
                      <p className="font-bold text-green-600">₹{incomingBooking.pricing}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleReject(incomingBooking.bookingId)}
                      className="py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all transform hover:scale-105"
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={() => handleAccept(incomingBooking.bookingId)}
                      className="py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all transform hover:scale-105"
                    >
                      ✅ Accept
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : !showMap && (
          <>
        {/* Availability Toggle */}
        <div className="max-w-4xl mx-auto mb-8">
          <button
            onClick={toggleAvailability}
            className={`w-full py-8 text-3xl font-bold rounded-2xl shadow-lg transition-all transform hover:scale-105 ${
              isOnline
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
            }`}
          >
            {isOnline ? '🟢 ONLINE - Ready for Jobs' : '🔴 OFFLINE - Not Accepting Jobs'}
          </button>
        {!worker.isVerified && (
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
            ⚠️ Your account is pending admin verification. You cannot go online yet.
          </div>
        )}
      </div>

      {/* Stats Dashboard */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-white to-yellow-50 p-6 rounded-xl shadow-lg border-2 border-yellow-200">
          <p className="text-gray-600 mb-2 font-semibold">Rating</p>
          <p className="text-4xl font-bold flex items-center gap-2">
            <span className="text-yellow-500">⭐</span>
            {worker.rating.toFixed(1)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-lg border-2 border-blue-200">
          <p className="text-gray-600 mb-2 font-semibold">Total Jobs</p>
          <p className="text-4xl font-bold text-blue-600">{worker.totalJobs}</p>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-lg border-2 border-green-200">
          <p className="text-gray-600 mb-2 font-semibold">Experience</p>
          <p className="text-4xl font-bold text-green-600">{worker.experience}y</p>
        </div>
      </div>

      {/* Incoming Booking Request */}
      {incomingBooking && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-2xl border-4 border-blue-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🔔 New Booking Request!
              </h2>
              <div className="text-5xl font-bold text-red-600 animate-pulse">{countdown}s</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-md border-2 border-blue-200">
                <span className="text-sm text-gray-600 font-semibold">Service</span>
                <p className="text-xl font-bold capitalize text-blue-600">{incomingBooking.profession}</p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-md border-2 border-green-200">
                <span className="text-sm text-gray-600 font-semibold">Distance</span>
                <p className="text-xl font-bold text-green-600">{incomingBooking.distance.toFixed(2)} km</p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-md border-2 border-purple-200">
                <span className="text-sm text-gray-600 font-semibold">Estimated Time</span>
                <p className="text-xl font-bold text-purple-600">~{incomingBooking.estimatedTime} mins</p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-md border-2 border-orange-200">
                <span className="text-sm text-gray-600 font-semibold">Earning</span>
                <p className="text-xl font-bold text-orange-600">₹{incomingBooking.pricing}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleReject(incomingBooking.bookingId)}
                className="py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-xl hover:from-red-600 hover:to-red-700 shadow-lg transform hover:scale-105 transition-all"
              >
                ❌ Reject
              </button>
              <button
                onClick={() => handleAccept(incomingBooking.bookingId)}
                className="py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-xl hover:from-green-600 hover:to-green-700 shadow-lg transform hover:scale-105 transition-all"
              >
                ✅ Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Worker Info */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border-2 border-gray-200">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Profile Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Name</p>
              <p className="font-bold text-gray-800">{worker.userId.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Profession</p>
              <p className="font-bold capitalize text-gray-800">{worker.profession}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Email</p>
              <p className="font-bold text-gray-800">{worker.userId.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Phone</p>
              <p className="font-bold text-gray-800">{worker.userId.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Verification Status</p>
              <p className={`font-bold ${worker.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                {worker.isVerified ? '✅ Verified' : '⏳ Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
