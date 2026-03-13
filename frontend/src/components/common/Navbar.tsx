// UI component: renders and manages the Navbar feature block.
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, User, LogOut, Home, Briefcase, Shield, Sparkles, Info, Mail, LayoutDashboard, UserCircle } from 'lucide-react';
import { APP_NAME } from '../../utils/constants';
import mainLogo from '../../assets/main_logo.png';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Calculate scroll progress
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Public links available to everyone
  const publicLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/about', label: 'About', icon: Info },
    { to: '/contact', label: 'Contact', icon: Mail },
  ];

  // Role-based dashboard and profile links
  const roleLinks = isAuthenticated
    ? user?.role === 'user'
      ? [
          { to: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/user/profile', label: 'Profile', icon: UserCircle },
        ]
      : user?.role === 'worker'
      ? [
          { to: '/worker/dashboard', label: 'Dashboard', icon: Briefcase },
          { to: '/worker/profile', label: 'Profile', icon: UserCircle },
        ]
      : user?.role === 'admin'
      ? [
          { to: '/admin', label: 'Admin Panel', icon: Shield },
        ]
      : []
    : [];

  // Auth links for non-authenticated users
  const authLinks = !isAuthenticated ? [
    { to: '/login', label: 'Login', icon: User },
    { to: '/register', label: 'Get Started', icon: Sparkles },
  ] : [];

  // Combine all links
  const navLinks = [...publicLinks, ...roleLinks, ...authLinks];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-green-500 origin-left z-[60]"
        style={{ scaleX: scrollProgress / 100 }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrollProgress / 100 }}
      />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-2xl border-b border-white/20'
            : 'bg-gradient-to-b from-white/50 to-transparent backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              to={isAuthenticated ? (user?.role === 'user' ? '/user/dashboard' : user?.role === 'worker' ? '/worker/dashboard' : '/admin') : '/'}
              className="flex items-center gap-3 group"
            >
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img 
                  src={mainLogo} 
                  alt={APP_NAME} 
                  className="h-12 w-12 object-contain" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-yellow-400 opacity-0 group-hover:opacity-30 rounded-full blur-xl transition-all duration-500"></div>
              </motion.div>
              <span className="font-display font-bold text-2xl bg-gradient-to-r from-green-600 via-yellow-600 to-green-600 bg-clip-text text-transparent bg-size-200 animate-gradient">
                {APP_NAME}
              </span>
            </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.to}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${
                      isActive(link.to)
                        ? 'text-white bg-gradient-to-r from-green-600 to-yellow-600 shadow-xl'
                        : 'text-gray-700 hover:text-green-600 hover:bg-white/60'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <Icon className={`w-4 h-4 transition-transform duration-300 ${!isActive(link.to) && 'group-hover:scale-110 group-hover:-rotate-12'}`} />
                    <span className="relative z-10">{link.label}</span>
                    {!isActive(link.to) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-600 to-yellow-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    )}
                  </Link>
                </motion.div>
              );
            })}

            {isAuthenticated && (
              <motion.div 
                className="flex items-center gap-4 ml-4 pl-6 border-l border-gray-300/50"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-green-50 to-yellow-50 rounded-full shadow-lg border border-white/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-yellow-600 flex items-center justify-center text-white font-bold shadow-md">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
                  </div>
                </div>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group border border-red-200 hover:border-red-300"
                >
                  <LogOut className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-300" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-white/60 transition-colors duration-300 backdrop-blur-sm"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6 text-gray-700" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6 text-gray-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-xl shadow-2xl border-t border-gray-200/50"
          >
            <div className="px-4 py-6 space-y-2 max-h-[70vh] overflow-y-auto">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.to}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.to}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium transition-all duration-300 ${
                        isActive(link.to)
                          ? 'text-white bg-gradient-to-r from-green-600 to-yellow-600 shadow-xl'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-yellow-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  </motion.div>
                );
              })}

              {isAuthenticated && (
                <>
                  <motion.div 
                    className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl shadow-lg mt-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-yellow-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
                    </div>
                  </motion.div>
                  <motion.button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-300 font-medium border border-red-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </>
  );
};
