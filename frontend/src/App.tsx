import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { MapProvider } from './context/MapContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Toast } from './components/common/Toast';
import React from 'react';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ResetPassword from './pages/Auth/ResetPassword';

// User Pages
import UserHome from './pages/User/Home';
import UserDashboard from './pages/User/Dashboard';
import UserProfile from './pages/User/Profile';

// Worker Pages
import WorkerDashboardNew from './pages/Worker/DashboardNew';
import WorkerProfile from './pages/Worker/Profile';
import WorkerOnboarding from './pages/Worker/Onboarding';
import PendingApproval from './pages/Worker/PendingApproval';

// Admin Pages
import AdminPanel from './pages/Admin/AdminPanel';

// Public Pages
import LandingNew from './pages/LandingNew';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Auth Guard for Login/Register pages
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Redirect based on user role
    if (user.role === 'user') {
      return <Navigate to="/user/dashboard" replace />;
    } else if (user.role === 'worker') {
      return <Navigate to="/worker/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <MapProvider>
            <NotificationProvider>
              <ToastProvider>
                <div className="min-h-screen bg-gray-50">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingNew />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    
                    {/* Auth Routes - redirect if already logged in */}
                    <Route path="/login" element={<AuthGuard><Login /></AuthGuard>} />
                    <Route path="/register" element={<AuthGuard><Register /></AuthGuard>} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    
                    {/* Worker Application - Public route */}
                    <Route path="/worker/pending-approval" element={<PendingApproval />} />

                    {/* User Routes */}
                    <Route
                      path="/user/home"
                      element={
                        <ProtectedRoute allowedRoles={['user']}>
                          <UserHome />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/user/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['user']}>
                          <UserDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/user/profile"
                      element={
                        <ProtectedRoute allowedRoles={['user']}>
                          <UserProfile />
                        </ProtectedRoute>
                      }
                    />

                    {/* Worker Routes */}
                    <Route
                      path="/worker/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['worker']}>
                          <WorkerDashboardNew />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/worker/profile"
                      element={
                        <ProtectedRoute allowedRoles={['worker']}>
                          <WorkerProfile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/worker/onboarding"
                      element={
                        <ProtectedRoute allowedRoles={['worker']}>
                          <WorkerOnboarding />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin/*"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminPanel />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch All */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>

                  <Toast />
                </div>
              </ToastProvider>
            </NotificationProvider>
          </MapProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
