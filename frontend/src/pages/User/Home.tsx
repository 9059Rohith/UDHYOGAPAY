// Page feature: drives the Home screen and its user interactions.
import React, { useState, useEffect } from 'react';
import { LeafletMap } from '../../components/map/LeafletMap';
import { Navbar } from '../../components/common/Navbar';
import { UserActiveBooking } from '../../components/user/ActiveBooking';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useToast } from '../../context/ToastContext';
import { Worker } from '../../types/worker';
import api from '../../services/api';
import { matchingService } from '../../services';
import { bookingService } from '../../services/chatService';
import { PROFESSIONS } from '../../utils/constants';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { Avatar } from '../../components/common/Avatar';

const UserHome: React.FC = () => {
  const { location, error: locationError, loading: locationLoading } = useGeolocation();
  const { showToast } = useToast();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [allWorkers, setAllWorkers] = useState<Worker[]>([]); // Store all workers
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [profession, setProfession] = useState('all'); // Default to 'all'
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [maxDistance, setMaxDistance] = useState(100); // km - increased for testing
  const [aiEngineStatus, setAiEngineStatus] = useState<string>('');
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [checkingBooking, setCheckingBooking] = useState(true);

  useEffect(() => {
    checkAIEngineStatus();
    checkActiveBooking();
  }, []);

  // Load all workers initially when location is available
  useEffect(() => {
    if (location) {
      loadAllWorkers();
    }
  }, [location]);

  // Filter workers when profession changes
  useEffect(() => {
    filterWorkersByProfession();
  }, [profession, allWorkers]);

  const checkAIEngineStatus = async () => {
    try {
      const status = await matchingService.getMatchingEngineStatus();
      setAiEngineStatus(status.status);
    } catch (error) {
      setAiEngineStatus('offline');
    }
  };

  const checkActiveBooking = async () => {
    try {
      const data = await bookingService.getUserActiveBooking();
      if (data.booking) {
        setActiveBooking(data.booking);
      }
    } catch (error) {
      console.error('Failed to check active booking:', error);
    } finally {
      setCheckingBooking(false);
    }
  };

  // Load all online workers initially
  const loadAllWorkers = async () => {
    if (!location) return;

    setLoading(true);
    setSearchError('');

    try {
      const response = await api.get('/users/workers/all-online');
      const loadedWorkers = response.data.workers || [];
      console.log('📍 Workers loaded:', loadedWorkers.length);
      setAllWorkers(loadedWorkers);
      setWorkers(loadedWorkers); // Show all initially
    } catch (err: any) {
      console.error('❌ Failed to load workers:', err);
      setSearchError(err.response?.data?.message || 'Failed to load workers');
      setAllWorkers([]);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter workers by selected profession
  const filterWorkersByProfession = () => {
    if (profession === 'all') {
      setWorkers(allWorkers);
    } else {
      const filtered = allWorkers.filter(w => w.profession === profession);
      setWorkers(filtered);
    }
  };

  const searchWorkers = async () => {
    if (!location) return;

    setLoading(true);
    setSearchError('');

    try {
      // Try AI matching service first
      if (aiEngineStatus === 'online') {
        const matchResult = await matchingService.findMatchingWorkers({
          serviceType: profession,
          userLocation: {
            latitude: location.latitude,
            longitude: location.longitude
          },
          urgency,
          maxDistance,
          minRating: 0
        });

        // Transform matched workers to Worker type
        const transformedWorkers: Worker[] = matchResult.workers.map((w: any) => ({
          _id: w._id,
          userId: { 
            _id: w._id, 
            name: w.name, 
            email: '', 
            phone: '',
            role: 'worker' as const
          },
          userDetails: {
            name: w.name,
            phone: '',
            profilePicture: w.profileImage
          },
          profession: w.profession,
          experience: w.experience,
          rating: w.rating,
          totalJobs: w.completedJobs,
          currentLocation: w.location,
          location: w.location,
          isAvailable: w.availability,
          availability: w.availability,
          isVerified: true,
          isOnline: true,
          skills: w.skills || [],
          exactDistance: w.distance.toFixed(2),
          estimatedTime: w.estimatedTime,
          matchScore: w.matchScore,
          documents: {},
          totalReviews: 0,
          reviews: [],
          hourlyRate: w.hourlyRate || 0
        }));

        setWorkers(transformedWorkers);
      } else {
        // Fallback to regular API
        const response = await api.post('/users/workers/nearby', {
          location: [location.longitude, location.latitude],
          profession,
          maxDistance: maxDistance * 1000 // Convert km to meters
        });

        // Transform fallback API workers to match expected format
        const fallbackWorkers = (response.data.workers || []).map((w: any) => ({
          ...w,
          exactDistance: w.exactDistance || (w.distance ? (w.distance / 1000).toFixed(2) : null)
        }));

        setWorkers(fallbackWorkers);
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.message || 'Failed to search workers');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerClick = async (worker: Worker) => {
    setSelectedWorker(worker);

    // Fetch route if available
    if (worker.routeGeometry) {
      const coords = worker.routeGeometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]] as [number, number] // Swap lon/lat
      );
      setRouteGeometry(coords);
    } else {
      setRouteGeometry(null);
    }
  };

  const handleBook = async (workerId: string) => {
    if (!location || !selectedWorker) return;

    try {
      const response = await api.post('/bookings/create', {
        workerId,
        profession: selectedWorker.profession, // Use worker's actual profession
        location: {
          coordinates: [location.longitude, location.latitude]
        }
      });

      showToast({
        type: 'success',
        message: `Booking created! OTP: ${response.data.otp}`,
        duration: 10000
      });
      
      // Clear selection and refresh data
      setSelectedWorker(null);
      setRouteGeometry(null);
      
      // Reload to show active booking
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      showToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create booking',
        duration: 5000
      });
    }
  };

  if (locationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert type="error" message={locationError} />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show active booking if exists
  if (activeBooking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 p-4">
          <UserActiveBooking 
            booking={activeBooking} 
            onUpdate={() => {
              setActiveBooking(null);
              checkActiveBooking();
            }} 
          />
        </div>
      </div>
    );
  }

  if (checkingBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      <Navbar />
      
      {/* Search Panel */}
      <div className="absolute top-20 left-4 z-[1000] bg-white p-4 rounded-lg shadow-2xl max-w-md border-2 border-blue-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">🤖 AI Worker Matching</h2>
          {aiEngineStatus && (
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              aiEngineStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {aiEngineStatus === 'online' ? '🟢 AI Online' : '🟡 Fallback'}
            </span>
          )}
        </div>
        
        <div className="space-y-3">
          <select
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="all">📍 All Workers</option>
            {PROFESSIONS.map((prof) => (
              <option key={prof.value} value={prof.value}>
                {prof.icon} {prof.label}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 font-semibold">Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High ⚡</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600 font-semibold">Max Distance</label>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
              </select>
            </div>
          </div>

          <button
            onClick={searchWorkers}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-bold text-base shadow-lg transform hover:scale-105 transition-all"
          >
            {loading ? '⏳ Matching...' : '🔍 Find Best Matches'}
          </button>
        </div>

        {searchError && (
          <Alert type="error" message={searchError} onClose={() => setSearchError('')} />
        )}

        <div className="mt-3 text-sm text-gray-700 bg-blue-50 p-2 rounded-lg">
          Found <span className="font-bold text-blue-600 text-lg">{workers.length}</span> {profession === 'all' ? 'workers' : profession + 's'}
          {workers.length > 0 && profession !== 'all' && <span className="text-xs ml-2 text-purple-600">(filtered)</span>}
        </div>
      </div>

      {/* Map */}
      <LeafletMap
        center={[location.latitude, location.longitude]}
        zoom={13}
        workers={workers}
        onWorkerClick={handleWorkerClick}
        onBookWorker={handleBook}
        userLocation={[location.latitude, location.longitude]}
        routeCoordinates={routeGeometry || undefined}
      />

      {/* Worker Details Card */}
      {selectedWorker && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white p-6 rounded-lg shadow-2xl max-w-md">
          <button
            onClick={() => {
              setSelectedWorker(null);
              setRouteGeometry(null);
            }}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>

          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar 
                src={(selectedWorker.userDetails as any)?.profilePicture} 
                alt={selectedWorker.userDetails?.name || selectedWorker.userId.name}
                size="lg"
              />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedWorker.userDetails?.name || selectedWorker.userId.name}
                </h3>
                <p className="text-gray-600 capitalize">{selectedWorker.profession}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold">{selectedWorker.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({selectedWorker.totalJobs} jobs)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Distance</p>
                <p className="text-lg font-bold text-blue-600">
                  {selectedWorker.exactDistance 
                    ? `${selectedWorker.exactDistance} km`
                    : selectedWorker.distance
                    ? `${(selectedWorker.distance / 1000).toFixed(2)} km`
                    : 'N/A'}
                </p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">ETA</p>
                <p className="text-lg font-bold text-green-600">
                  ~{selectedWorker.estimatedTime 
                    ? `${selectedWorker.estimatedTime} mins`
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Experience</p>
              <p className="text-lg font-semibold">{selectedWorker.experience} years</p>
            </div>

            {(selectedWorker as any).matchScore && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border-2 border-purple-200">
                <p className="text-xs text-gray-600 mb-1 font-semibold">🤖 AI Match Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(selectedWorker as any).matchScore}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {(selectedWorker as any).matchScore.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => handleBook(selectedWorker._id)}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Book Now 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHome;
