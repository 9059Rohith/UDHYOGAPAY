// Page feature: drives the DashboardNew screen and its user interactions.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, DollarSign, Star, MapPin, Clock,
  CheckCircle, Award, Activity, Calendar, Package,
  MessageSquare, Settings, Bell
} from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { WorkerActiveBooking } from '../../components/common/WorkerActiveBooking';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../context/ToastContext';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { workerService } from '../../services/workerService';
import { bookingService } from '../../services/bookingService';
import { bookingService as chatBookingService } from '../../services/chatService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { Booking } from '../../types';

interface BookingRequest {
  bookingId: string;
  profession: string;
  distance: number;
  estimatedTime: number;
  pricing: number;
  userLocation: [number, number];
  timeout: number;
}

// Import assets
import manWithHeadphones from '../../assets/man_with_headphones.png';
import shakehand from '../../assets/shakehand.png';
import dollarSymbol from '../../assets/dollar_symbol.png';
import stars from '../../assets/stars.png';

const WorkerDashboardNew: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useToast();
  const [isAvailable, setIsAvailable] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [checkingBooking, setCheckingBooking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [workerId, setWorkerId] = useState<string>('');
  const [incomingBooking, setIncomingBooking] = useState<BookingRequest | null>(null);
  const [countdown, setCountdown] = useState(30);

  // Enable real-time location tracking when worker is available
  useLocationTracking(workerId, isAvailable);

  // Countdown timer for incoming booking requests
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

  // Fetch bookings data
  const fetchBookings = async () => {
    try {
      const bookingsData = await bookingService.getWorkerBookings();
      setBookings(bookingsData.bookings || []);
    } catch (err: any) {
      console.error('Error fetching worker bookings:', err);
    }
  };

  // Check for active booking
  const checkActiveBooking = async () => {
    try {
      const data = await chatBookingService.getWorkerActiveBooking();
      if (data.booking) {
        setActiveBooking(data.booking);
      }
    } catch (error) {
      console.error('Failed to check active booking:', error);
    } finally {
      setCheckingBooking(false);
    }
  };

  // Fetch worker profile to get worker ID
  const fetchWorkerProfile = async () => {
    try {
      const response = await workerService.getProfile();
      setWorkerId(response._id);
      setIsAvailable(response.isOnline || false);
      
      // If worker is online, immediately update their current location
      if (response.isOnline && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Update location via API
              await workerService.updateLocation(
                position.coords.latitude,
                position.coords.longitude
              );
              console.log('✅ Worker location updated on dashboard load');
            } catch (error) {
              console.error('Failed to update location:', error);
            }
          },
          (error) => {
            console.warn('Location permission denied:', error);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    } catch (error) {
      console.error('Failed to fetch worker profile:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchWorkerProfile(), fetchBookings(), checkActiveBooking()]);
      } catch (err: any) {
        console.error('Error fetching worker dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Socket listener for real-time booking updates
  useEffect(() => {
    if (socket && user) {
      // Join worker room
      socket.emit('worker:online', user.id);

      // Listen for new booking requests
      socket.on('booking:request', (data: any) => {
        console.log('New booking request received:', data);
        
        // Set incoming booking for popup
        setIncomingBooking(data);
        
        // Refresh bookings and check for active booking
        fetchBookings();
        checkActiveBooking();
        
        // Play vibration
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Booking Request!', {
            body: `${data.profession} job - ${(data.distance / 1000).toFixed(2)} km away`,
            icon: '/logo.png'
          });
        }
        
        // Show toast notification
        showToast({
          type: 'info',
          message: `🔔 New booking request for ${data.profession}! Distance: ${(data.distance / 1000).toFixed(2)} km`,
          duration: 5000
        });
      });

      // Listen for booking status updates
      socket.on('booking:accepted', () => {
        fetchBookings();
        checkActiveBooking();
      });

      socket.on('booking:completed', () => {
        fetchBookings();
        checkActiveBooking();
      });

      return () => {
        socket.off('booking:request');
        socket.off('booking:accepted');
        socket.off('booking:completed');
      };
    }
  }, [socket, user]);

  // Handle accept booking
  const handleAccept = async (bookingId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${bookingId}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to accept booking');

      setIncomingBooking(null);
      checkActiveBooking();
      fetchBookings();
      
      showToast({
        type: 'success',
        message: '✅ Booking accepted! Customer details loaded.',
        duration: 3000
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        message: err.message || 'Failed to accept booking',
        duration: 5000
      });
    }
  };

  // Handle reject booking
  const handleReject = async (bookingId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${bookingId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to reject booking');

      setIncomingBooking(null);
      
      showToast({
        type: 'info',
        message: 'Booking rejected',
        duration: 3000
      });
    } catch (err: any) {
      console.error('Failed to reject booking:', err);
      setIncomingBooking(null); // Clear anyway
    }
  };

  // Toggle availability
  const toggleAvailability = async () => {
    try {
      const newAvailability = !isAvailable;
      
      if (newAvailability) {
        // Going online - request location and notification permissions
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        
        showToast({
          type: 'success',
          message: 'Please allow location access to go online',
          duration: 3000
        });
      }
      
      await workerService.toggleAvailability(newAvailability);
      setIsAvailable(newAvailability);
      
      showToast({
        type: 'success',
        message: newAvailability ? '✅ You are now ONLINE and visible to users!' : 'You are now offline',
        duration: 3000
      });
    } catch (err: any) {
      console.error('Error toggling availability:', err);
      showToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to toggle availability. Please check location permissions.',
        duration: 5000
      });
    }
  };

  // Calculate stats from real data
  const activeJobsCount = bookings.filter(b => 
    ['pending', 'accepted', 'started'].includes(b.status)
  ).length;

  const completedJobs = bookings.filter(b => b.status === 'completed').length;
  
  const ratedBookings = bookings.filter(b => b.rating && b.rating > 0);
  const avgRating = ratedBookings.length > 0
    ? (ratedBookings.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBookings.length).toFixed(1)
    : '0.0';

  // Calculate earnings by period
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const completedBookings = bookings.filter(b => b.status === 'completed');
  
  const todayEarnings = completedBookings
    .filter(b => new Date(b.updatedAt) >= todayStart)
    .reduce((sum, b) => sum + (b.pricing || 0), 0);

  const weekEarnings = completedBookings
    .filter(b => new Date(b.updatedAt) >= weekStart)
    .reduce((sum, b) => sum + (b.pricing || 0), 0);

  const monthEarnings = completedBookings
    .filter(b => new Date(b.updatedAt) >= monthStart)
    .reduce((sum, b) => sum + (b.pricing || 0), 0);

  const stats = [
    {
      icon: Briefcase,
      label: 'Active Jobs',
      value: activeJobsCount.toString(),
      change: bookings.length > 0 ? `${bookings.length} total` : 'No jobs',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: DollarSign,
      label: 'Earnings (Month)',
      value: `₹${monthEarnings.toLocaleString()}`,
      change: `+₹${(monthEarnings - weekEarnings).toLocaleString()}`,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: Star,
      label: 'Rating',
      value: avgRating,
      change: `${ratedBookings.length} reviews`,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: CheckCircle,
      label: 'Completed',
      value: completedJobs.toString(),
      change: 'All time',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50'
    },
  ];

  // Get active jobs from bookings
  const activeJobsList = bookings
    .filter(b => ['pending', 'accepted', 'started'].includes(b.status))
    .slice(0, 5)
    .map((booking) => {
      const userData = typeof booking.user === 'object' ? booking.user : null;
      return {
        id: booking._id,
        service: booking.profession,
        customer: userData?.name || 'Customer',
        location: booking.location?.address || 'Location not specified',
        time: new Date(booking.createdAt).toLocaleString(),
        amount: `₹${booking.pricing?.toLocaleString() || '0'}`,
        status: booking.status,
        image: shakehand
      };
    });

  // Convert bookings to activity feed
  const recentActivity = bookings.slice(0, 5).map((booking) => {
    const userData = typeof booking.user === 'object' ? booking.user : null;
    const customerName = userData?.name || 'Customer';
    const timeAgo = getTimeAgo(booking.updatedAt);
    
    let message = '';
    let icon = Activity;
    let color = 'text-gray-600';
    
    switch (booking.status) {
      case 'pending':
        message = `New booking request from ${customerName}`;
        icon = Briefcase;
        color = 'text-blue-600';
        break;
      case 'completed':
        if (booking.rating) {
          message = `New ${booking.rating}-star review from ${customerName}`;
          icon = Star;
          color = 'text-yellow-600';
        } else {
          message = `Job completed for ${customerName}`;
          icon = CheckCircle;
          color = 'text-purple-600';
        }
        break;
      case 'started':
        message = `Job in progress for ${customerName}`;
        icon = Clock;
        color = 'text-blue-600';
        break;
      default:
        if (booking.pricing) {
          message = `Payment received - ₹${booking.pricing.toLocaleString()}`;
          icon = DollarSign;
          color = 'text-green-600';
        } else {
          message = `Booking from ${customerName}`;
          icon = Briefcase;
          color = 'text-gray-600';
        }
    }
    
    return {
      type: booking.status,
      message,
      time: timeAgo,
      icon,
      color
    };
  });

  // Helper function to calculate time ago
  function getTimeAgo(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }

  const earnings = {
    today: todayEarnings,
    week: weekEarnings,
    month: monthEarnings,
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'pending': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending' },
      'accepted': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Accepted' },
      'started': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'In Progress' },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };
    const badge = badges[status] || badges['pending'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading || checkingBooking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="pt-24 flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Show active booking if exists
  if (activeBooking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 p-4">
          <WorkerActiveBooking 
            booking={activeBooking} 
            onUpdate={() => {
              setActiveBooking(null);
              checkActiveBooking();
              fetchBookings();
            }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 shadow-2xl"
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">
                  Hello, {user?.name}! 💼
                </h1>
                <p className="text-white/90 text-lg">
                  You have {activeJobsCount} active jobs today
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Availability Toggle */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3">
                  <span className="text-white font-medium">Status:</span>
                  <button
                    onClick={toggleAvailability}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                      isAvailable ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        isAvailable ? 'translate-x-9' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-white font-bold">
                    {isAvailable ? 'Available' : 'Offline'}
                  </span>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/worker/profile">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
                      <Settings className="w-5 h-5 mr-2" />
                      Settings
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
            <img 
              src={manWithHeadphones} 
              alt="decoration" 
              className="absolute bottom-0 right-10 w-40 h-40 object-contain opacity-20"
            />
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`}></div>
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-14 h-14 ${stat.bgColor} rounded-xl mb-4`}>
                      <stat.icon className={`w-7 h-7 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                    <p className={`text-sm bg-gradient-to-r ${stat.color} bg-clip-text text-transparent font-medium`}>
                      {stat.change}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Active Jobs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Jobs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Active Jobs</h2>
                    <Link to="/worker/jobs" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                      View All
                      <Package className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {activeJobsList.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No active jobs at the moment</p>
                    ) : (
                      activeJobsList.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100"
                      >
                        <img 
                          src={job.image} 
                          alt={job.service} 
                          className="w-20 h-20 object-contain rounded-lg bg-white p-2 shadow-sm"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900">{job.service}</h3>
                            {getStatusBadge(job.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Customer: {job.customer}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {job.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600 mb-2">{job.amount}</p>
                          <Button variant="primary" size="sm">
                            View Job
                          </Button>
                        </div>
                      </motion.div>
                    )))}
                  </div>
                </Card>
              </motion.div>

              {/* Earnings Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-green-600 to-emerald-600 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Earnings Overview</h2>
                    <img src={dollarSymbol} alt="earnings" className="w-16 h-16 object-contain opacity-50" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-white/80 text-sm mb-1">Today</p>
                      <p className="text-2xl font-bold">₹{earnings.today.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-white/80 text-sm mb-1">This Week</p>
                      <p className="text-2xl font-bold">₹{earnings.week.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-white/80 text-sm mb-1">This Month</p>
                      <p className="text-2xl font-bold">₹{earnings.month.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Performance Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Metrics</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">Job Completion Rate</span>
                        <span className="text-green-600 font-bold">96%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: '96%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">Customer Satisfaction</span>
                        <span className="text-blue-600 font-bold">98%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">Response Time</span>
                        <span className="text-yellow-600 font-bold">94%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Activity & Info */}
            <div className="space-y-6">
              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      Notifications
                      {activeJobsCount > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                          {activeJobsCount}
                        </span>
                      )}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-gray-900">New Job Request</p>
                      <p className="text-xs text-gray-600 mt-1">Plumbing service in Ram Nagar</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm font-medium text-gray-900">Payment Received</p>
                      <p className="text-xs text-gray-600 mt-1">₹2,100 for electrical work</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <p className="text-sm font-medium text-gray-900">New Review</p>
                      <p className="text-xs text-gray-600 mt-1">5 stars from Priya Sharma</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${activity.color.replace('text-', 'bg-')}/10`}>
                          <activity.icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Certifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-8 h-8 text-yellow-600" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Certifications</h3>
                      <p className="text-sm text-gray-600">Your credentials</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="text-sm font-medium text-gray-700">✓ Verified Professional</span>
                      <img src={stars} alt="badge" className="w-6 h-6" />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="text-sm font-medium text-gray-700">✓ Background Checked</span>
                      <img src={stars} alt="badge" className="w-6 h-6" />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="text-sm font-medium text-gray-700">✓ Top Rated Worker</span>
                      <img src={stars} alt="badge" className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                  <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">View Schedule</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all">
                      <MessageSquare className="w-5 h-5" />
                      <span className="font-medium">Messages</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all">
                      <DollarSign className="w-5 h-5" />
                      <span className="font-medium">Earnings Report</span>
                    </button>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Booking Request Modal */}
      {incomingBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                🔔 New Booking Request!
              </h2>
              <div className="text-5xl font-bold text-red-600 animate-pulse">{countdown}s</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-300">
                <span className="text-sm text-gray-700 font-semibold">Service</span>
                <p className="text-2xl font-bold capitalize text-blue-600 mt-1">{incomingBooking.profession}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-300">
                <span className="text-sm text-gray-700 font-semibold">Distance</span>
                <p className="text-2xl font-bold text-green-600 mt-1">{(incomingBooking.distance / 1000).toFixed(2)} km</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-300">
                <span className="text-sm text-gray-700 font-semibold">Estimated Time</span>
                <p className="text-2xl font-bold text-purple-600 mt-1">~{Math.round(incomingBooking.estimatedTime / 60)} mins</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-300">
                <span className="text-sm text-gray-700 font-semibold">Earning</span>
                <p className="text-2xl font-bold text-orange-600 mt-1">₹{incomingBooking.pricing}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleReject(incomingBooking.bookingId)}
                className="py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-xl hover:from-red-600 hover:to-red-700 shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                ❌ Reject
              </button>
              <button
                onClick={() => handleAccept(incomingBooking.bookingId)}
                className="py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-xl hover:from-green-600 hover:to-green-700 shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                ✅ Accept
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default WorkerDashboardNew;
