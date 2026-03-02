import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Edit2, Save, X,
  Camera, Shield, Bell, Lock, CreditCard,
  CheckCircle, Star, Activity, Settings, Calendar, Trash2
} from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { userService } from '../../services/userService';
import { bookingService } from '../../services/bookingService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import type { UserProfile as UserProfileType, Booking } from '../../types';

// Import assets
import girlInJoy from '../../assets/girl_in_joy.png';
import shakehand from '../../assets/shakehand.png';
import stars from '../../assets/stars.png';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileInfo, setProfileInfo] = useState<UserProfileType | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bio: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const profile = await userService.getProfile();
        setProfileInfo(profile);
        
        // Update form data with real profile
        setProfileData({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          pincode: profile.address?.pinCode || '',
          bio: 'Udhyoga Pay user',
        });
        
        // Fetch booking history
        const bookingsData = await bookingService.getAll({ limit: 10 });
        setBookings(bookingsData.data || []);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats from real data
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.pricing || 0), 0);
  const reviewsGiven = bookings.filter(b => b.rating).length;
  const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : '2025';

  // Map bookings to activity history
  const activityHistory = completedBookings.slice(0, 10).map((booking) => {
    const workerData = typeof booking.worker === 'object' ? booking.worker : null;
    return {
      id: booking._id,
      service: booking.profession,
      worker: workerData?.userId?.name || 'Worker',
      date: new Date(booking.createdAt).toLocaleDateString(),
      amount: `₹${booking.pricing?.toLocaleString() || '0'}`,
      rating: booking.rating || 0,
      status: booking.status,
      image: shakehand
    };
  });

  const stats = [
    { label: 'Total Bookings', value: bookings.length.toString(), icon: CheckCircle, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: CreditCard, color: 'from-green-500 to-emerald-500' },
    { label: 'Reviews Given', value: reviewsGiven.toString(), icon: Star, color: 'from-yellow-500 to-orange-500' },
    { label: 'Member Since', value: memberSince, icon: Activity, color: 'from-purple-500 to-pink-500' },
  ];

  const handleSave = async () => {
    try {
      await userService.updateProfile(profileData);
      // Refresh profile data
      const updatedProfile = await userService.getProfile();
      setProfileInfo(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original profile data
    if (profileInfo) {
      setProfileData({
        name: profileInfo.name || '',
        email: profileInfo.email || '',
        phone: profileInfo.phone || '',
        address: profileInfo.address?.street || '',
        city: profileInfo.address?.city || '',
        state: profileInfo.address?.state || '',
        pincode: profileInfo.address?.pinCode || '',
        bio: 'Udhyoga Pay user',
      });
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
              <div className="h-48 bg-gradient-to-r from-green-600 via-yellow-600 to-green-600 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <img src={stars} alt="decoration" className="absolute top-4 right-4 w-20 h-20 object-contain opacity-30" />
              </div>

              {/* Profile Info */}
              <div className="relative px-6 pb-6">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-20">
                  {/* Profile Picture */}
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl bg-gradient-to-r from-green-600 to-yellow-600 flex items-center justify-center overflow-hidden">
                      <img 
                        src={girlInJoy} 
                        alt={profileData.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {profileData.name}
                    </h1>
                    <p className="text-gray-600 mb-4">{profileData.bio}</p>
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

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'profile', label: 'Profile Details', icon: User },
                { id: 'activity', label: 'Activity History', icon: Activity },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-600 to-yellow-600 text-white shadow-lg'
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={profileData.state}
                      onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                    <input
                      type="text"
                      value={profileData.pincode}
                      onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                    />
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'activity' && (
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity History</h2>
                <div className="space-y-4">
                  {activityHistory.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100"
                    >
                      <img 
                        src={activity.image} 
                        alt={activity.service} 
                        className="w-16 h-16 object-contain rounded-lg bg-white p-2 shadow-sm"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{activity.service}</h3>
                        <p className="text-sm text-gray-600 mb-2">Worker: {activity.worker}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {activity.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {activity.rating} stars
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600 mb-1">{activity.amount}</p>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          {activity.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-green-600" />
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        />
                      </div>
                      <Button variant="primary">Update Password</Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      Two-Factor Authentication
                    </h3>
                    <p className="text-gray-600 mb-4">Add an extra layer of security to your account</p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'settings' && (
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferences</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-green-600" />
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Email notifications', description: 'Receive email updates about your bookings' },
                        { label: 'SMS notifications', description: 'Get text messages for important updates' },
                        { label: 'Push notifications', description: 'Receive push notifications on your device' },
                        { label: 'Marketing emails', description: 'Receive promotional offers and updates' },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600">
                            <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
                          </button>
                        </div>
                      ))}
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

export default UserProfile;
