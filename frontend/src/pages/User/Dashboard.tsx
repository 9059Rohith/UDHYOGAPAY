// Page feature: drives the Dashboard screen and its user interactions.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Clock, MapPin, Star, Calendar,
  CheckCircle, Activity, DollarSign, Bell, Settings,
  MessageSquare, Plus, ArrowRight
} from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { bookingService } from '../../services/bookingService';
import { userService } from '../../services/userService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { Booking } from '../../types';

// Import assets
import manHoldingMobile from '../../assets/man_holding_mobile.png';
import shakehand from '../../assets/shakehand.png';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch bookings
        const bookingsData = await bookingService.getAll({ limit: 10 });
        setBookings(bookingsData.data || []);
        
        // Fetch notifications
        try {
          const notificationsData = await userService.getNotifications();
          setNotifications(notificationsData || []);
        } catch (err) {
          console.log('Notifications not available:', err);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats from real bookings data
  const activeBookings = bookings.filter(b => ['pending', 'accepted', 'started'].includes(b.status)).length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalSpent = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.pricing || 0), 0);
  const reviewsGiven = bookings.filter(b => b.rating).length;
  const avgRating = reviewsGiven > 0
    ? (bookings.filter(b => b.rating).reduce((sum, b) => sum + (b.rating || 0), 0) / reviewsGiven).toFixed(1)
    : '0.0';

  const stats = [
    {
      icon: Briefcase,
      label: 'Active Bookings',
      value: activeBookings.toString(),
      change: bookings.length > 0 ? `${bookings.length} total` : 'No bookings',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: CheckCircle,
      label: 'Completed',
      value: completedBookings.toString(),
      change: completedBookings > 0 ? 'Well done!' : 'Start booking',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: DollarSign,
      label: 'Total Spent',
      value: `₹${totalSpent.toLocaleString()}`,
      change: completedBookings > 0 ? `${completedBookings} jobs` : 'No expenses',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: Star,
      label: 'Reviews Given',
      value: reviewsGiven.toString(),
      change: `${avgRating} avg rating`,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50'
    },
  ];

  // Get recent bookings (latest 5)
  const recentBookings = bookings.slice(0, 5).map((booking) => {
    const workerData = typeof booking.worker === 'object' ? booking.worker : null;
    
    return {
      id: booking._id,
      service: booking.profession,
      worker: workerData?.userId?.name || 'Worker',
      date: new Date(booking.createdAt).toLocaleDateString(),
      time: new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: booking.status,
      location: booking.location?.address || 'Location not specified',
      image: shakehand,
      pricing: booking.pricing
    };
  });

  // Convert bookings to activities
  const activities = bookings.slice(0, 5).map((booking) => {
    const workerData = typeof booking.worker === 'object' ? booking.worker : null;
    const workerName = workerData?.userId?.name || 'Worker';
    const timeAgo = getTimeAgo(booking.updatedAt);
    
    let message = '';
    let icon = Activity;
    let color = 'text-gray-600';
    
    switch (booking.status) {
      case 'accepted':
        message = `Booking accepted by ${workerName}`;
        icon = CheckCircle;
        color = 'text-green-600';
        break;
      case 'started':
        message = `${workerName} started working on your ${booking.profession} job`;
        icon = Clock;
        color = 'text-blue-600';
        break;
      case 'completed':
        message = `${booking.profession} job completed by ${workerName}`;
        icon = CheckCircle;
        color = 'text-green-600';
        break;
      case 'cancelled':
        message = `${booking.profession} booking was cancelled`;
        icon = Activity;
        color = 'text-red-600';
        break;
      default:
        message = `New ${booking.profession} booking request`;
        icon = Briefcase;
        color = 'text-blue-600';
    }
    
    return {
      type: 'booking',
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
    
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="pt-24 flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" />
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
            className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-yellow-600 to-green-600 p-8 shadow-2xl"
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-white/90 text-lg">
                  Track your bookings and manage your home services
                </p>
              </div>
              <div className="flex gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/user/home">
                    <Button variant="primary" size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                      <Plus className="w-5 h-5 mr-2" />
                      New Booking
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/user/profile">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
                      <Settings className="w-5 h-5 mr-2" />
                      Settings
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
            <img 
              src={manHoldingMobile} 
              alt="decoration" 
              className="absolute bottom-0 right-10 w-32 h-32 object-contain opacity-20"
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
            {/* Left Column - Recent Bookings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Bookings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Recent Bookings</h2>
                    <Link to="/user/bookings" className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2">
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {recentBookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100"
                      >
                        <img 
                          src={booking.image} 
                          alt={booking.service} 
                          className="w-16 h-16 object-contain rounded-lg bg-white p-2 shadow-sm"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900">{booking.service}</h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Worker: {booking.worker}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {booking.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {booking.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {booking.location}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Profile Completion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Complete Your Profile</h3>
                      <p className="text-sm text-gray-600">Add more details to get better matches</p>
                    </div>
                    <div className="text-3xl font-bold text-purple-600">75%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex gap-3">
                    <Link to="/user/profile" className="flex-1">
                      <Button variant="primary" size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                        Complete Profile
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Activity & Notifications */}
            <div className="space-y-6">
              {/* Notifications Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-green-600" />
                      Notifications
                      {notifications.length > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                          {notifications.length}
                        </span>
                      )}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-gray-900">Booking Confirmed</p>
                      <p className="text-xs text-gray-600 mt-1">Your plumbing service is scheduled for tomorrow</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm font-medium text-gray-900">Worker Arrived</p>
                      <p className="text-xs text-gray-600 mt-1">Rajesh Kumar has arrived at your location</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-sm font-medium text-gray-900">Payment Pending</p>
                      <p className="text-xs text-gray-600 mt-1">Complete payment for completed service</p>
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
                    <Activity className="w-5 h-5 text-green-600" />
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
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

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-green-600 to-yellow-600 text-white">
                  <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Link to="/user/home" className="w-full">
                      <button className="w-full flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all">
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">New Booking</span>
                      </button>
                    </Link>
                    <button className="w-full flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all">
                      <MessageSquare className="w-5 h-5" />
                      <span className="font-medium">Messages</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all">
                      <Star className="w-5 h-5" />
                      <span className="font-medium">Rate Workers</span>
                    </button>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserDashboard;
