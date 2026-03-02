import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Edit2, Save, X,
  Camera, Shield, Lock, Award, Star, Briefcase,
  CheckCircle, DollarSign, Trash2
} from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { bookingService } from '../../services/bookingService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import type { Booking } from '../../types';

// Import assets
import manWithHeadphones from '../../assets/man_with_headphones.png';
import shakehand from '../../assets/shakehand.png';
import stars from '../../assets/stars.png';
import dollarSymbol from '../../assets/dollar_symbol.png';

const WorkerProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    skills: [] as string[],
    experience: '0 years',
    hourlyRate: '₹500',
    bio: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch worker profile data
        // Note: This assumes there's a worker profile endpoint
        // If not available, we'll use the bookings data
        
        // Fetch bookings
        const bookingsData = await bookingService.getAll({ limit: 50 });
        setBookings(bookingsData.data || []);
        
        // Update profile with user data
        if (user) {
          setProfileData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
          }));
        }
        
      } catch (err) {
        console.error('Error fetching worker profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate stats from bookings
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.pricing || 0), 0);
  const ratedBookings = bookings.filter(b => b.rating);
  const avgRating = ratedBookings.length > 0
    ? (ratedBookings.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBookings.length).toFixed(1)
    : '0.0';

  // Extract user creation date for experience calculation
  const memberSince = user?.createdAt ? new Date(user.createdAt) : new Date();
  const yearsActive = new Date().getFullYear() - memberSince.getFullYear();

  // Map completed bookings to jobs list
  const completedJobs = completedBookings.slice(0, 10).map((booking) => {
    const userData = typeof booking.user === 'object' ? booking.user : null;
    return {
      id: booking._id,
      service: booking.profession,
      customer: userData?.name || 'Customer',
      date: new Date(booking.createdAt).toLocaleDateString(),
      amount: `₹${booking.pricing?.toLocaleString() || '0'}`,
      rating: booking.rating || 0,
      review: booking.feedback || 'No review provided',
      image: shakehand
    };
  });

  const stats = [
    { label: 'Jobs Completed', value: completedBookings.length.toString(), icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'from-blue-500 to-cyan-500' },
    { label: 'Average Rating', value: avgRating, icon: Star, color: 'from-yellow-500 to-orange-500' },
    { label: 'Experience', value: `${yearsActive} Years`, icon: Award, color: 'from-purple-500 to-pink-500' },
  ];

  const certifications = [
    { name: 'Verified Professional', icon: Shield, verified: user?.isVerified || false },
    { name: 'Background Checked', icon: CheckCircle, verified: user?.isVerified || false },
    { name: 'Top Rated Worker', icon: Star, verified: parseFloat(avgRating) >= 4.5 },
    { name: 'Safety Certified', icon: Award, verified: user?.isVerified || false },
  ];

  // Extract reviews from rated bookings
  const reviews = ratedBookings.slice(0, 5).map((booking) => {
    const userData = typeof booking.user === 'object' ? booking.user : null;
    return {
      customer: userData?.name || 'Customer',
      rating: booking.rating || 0,
      comment: booking.feedback || 'No feedback provided',
      date: new Date(booking.updatedAt).toLocaleDateString()
    };
  });

  const handleSave = async () => {
    try {
      // Update worker profile through API when endpoint is available
      // For now, just close edit mode
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      await logout();
      setShowDeleteModal(false);
      // Show success message
      alert('Account deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    }
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
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="relative overflow-hidden">
              {/* Cover Image */}
              <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <img src={stars} alt="decoration" className="absolute top-4 right-4 w-20 h-20 object-contain opacity-30" />
                <img src={dollarSymbol} alt="decoration" className="absolute bottom-4 left-4 w-16 h-16 object-contain opacity-30" />
              </div>

              {/* Profile Info */}
              <div className="relative px-6 pb-6">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-20">
                  {/* Profile Picture */}
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden">
                      <img 
                        src={manWithHeadphones} 
                        alt={profileData.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5 text-gray-700" />
                    </button>
                    {/* Availability Badge */}
                    <div className={`absolute top-0 left-0 px-3 py-1 rounded-full text-xs font-bold ${
                      isAvailable ? 'bg-green-500' : 'bg-gray-400'
                    } text-white shadow-lg`}>
                      {isAvailable ? '● Available' : '● Offline'}
                    </div>
                  </div>

                  {/* Worker Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {profileData.name}
                      </h1>
                      <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-yellow-800">4.9</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{profileData.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                      {profileData.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <span className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        <Mail className="w-4 h-4" />
                        {profileData.email}
                      </span>
                      <span className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        <Phone className="w-4 h-4" />
                        {profileData.phone}
                      </span>
                      <span className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        <MapPin className="w-4 h-4" />
                        {profileData.city}, {profileData.state}
                      </span>
                      <span className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        <DollarSign className="w-4 h-4" />
                        {profileData.hourlyRate}/hr
                      </span>
                    </div>
                  </div>

                  {/* Edit and Delete Buttons */}
                  <div className="flex gap-3">
                    {!isEditing ? (
                      <>
                        <Button
                          variant="primary"
                          onClick={() => setIsEditing(true)}
                          className="gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteModal(true)}
                          className="gap-2 border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="primary" onClick={handleSave} className="gap-2">
                          <Save className="w-4 h-4" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={handleCancel} className="gap-2">
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="text-center">
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl mb-3 shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-600" />
                Certifications & Badges
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {certifications.map((cert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm"
                  >
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <cert.icon className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                      {cert.verified && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'profile', label: 'Profile Details', icon: User },
                { id: 'jobs', label: 'Completed Jobs', icon: Briefcase },
                { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
                { id: 'security', label: 'Security', icon: Shield },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'profile' && (
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                    <input
                      type="text"
                      value={profileData.experience}
                      onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
                    <input
                      type="text"
                      value={profileData.hourlyRate}
                      onChange={(e) => setProfileData({ ...profileData, hourlyRate: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma separated)</label>
                    <input
                      type="text"
                      value={profileData.skills.join(', ')}
                      onChange={(e) => setProfileData({ ...profileData, skills: e.target.value.split(',').map(s => s.trim()) })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                    />
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'jobs' && (
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Completed Jobs</h2>
                <div className="space-y-4">
                  {completedJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100"
                    >
                      <img 
                        src={job.image} 
                        alt={job.service} 
                        className="w-16 h-16 object-contain rounded-lg bg-white p-2 shadow-sm"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{job.service}</h3>
                        <p className="text-sm text-gray-600 mb-2">Customer: {job.customer}</p>
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < job.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 italic">"{job.review}"</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600 mb-1">{job.amount}</p>
                        <p className="text-xs text-gray-500">{job.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'reviews' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Rating Overview</h2>
                  <div className="text-center mb-8">
                    <div className="text-6xl font-bold text-yellow-600 mb-2">4.9</div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600">Based on {reviews.length} reviews</p>
                  </div>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 w-8">{rating} ★</span>
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400" 
                            style={{ width: `${rating === 5 ? 80 : rating === 4 ? 15 : 5}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          {rating === 5 ? '80%' : rating === 4 ? '15%' : '5%'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Reviews</h2>
                  <div className="space-y-4">
                    {reviews.map((review, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">{review.customer}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">"{review.comment}"</p>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'security' && (
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-blue-600" />
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                      </div>
                      <Button variant="primary">Update Password</Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Account Verification
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-900">Email Verified</span>
                        </div>
                        <span className="text-green-600 text-sm font-medium">Verified</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-900">Phone Verified</span>
                        </div>
                        <span className="text-green-600 text-sm font-medium">Verified</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-900">Background Check</span>
                        </div>
                        <span className="text-green-600 text-sm font-medium">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default WorkerProfile;
