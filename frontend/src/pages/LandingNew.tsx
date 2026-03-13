// Page feature: drives the LandingNew screen and its user interactions.
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ArrowRight, CheckCircle, Star, Users, Briefcase, MapPin,
  Zap, Shield, Heart,
  Phone, Mail, MapPinIcon
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { APP_NAME } from '../utils/constants';

// Import all assets
import mainLogo from '../assets/main_logo.png';
import manHoldingMobile from '../assets/man_holding_mobile.png';
import girlInJoy from '../assets/girl_in_joy.png';
import balloons from '../assets/ballons.png';
import bullseye from '../assets/bulleye.png';
import shakehand from '../assets/shakehand.png';
import treasure from '../assets/treasure.png';
import locationImg from '../assets/location.png';
import dollarSymbol from '../assets/dollar_symbol.png';
import drone from '../assets/drone.png';
import groupOfCoins from '../assets/group_of_coins.png';
import handHoldingMap from '../assets/hand_holding_map.png';
import house from '../assets/house.png';
import mansion from '../assets/mansion.png';
import mainHoldingBoxService from '../assets/main_holding_box_service.png';
import manWithHeadphones from '../assets/man_with_headphones.png';
import mobilFingerprint from '../assets/mobil_fingerprint.png';
import penguin from '../assets/penguin.png';
import socialMedia from '../assets/social_media.png';
import stars from '../assets/stars.png';
import unityPeople from '../assets/unity_people_holding_hands.png';
import womenCustomerSupport from '../assets/women_customer_support.png';
import cuteAvocado from '../assets/cute_avacado_animate.png';
import instagramIcon from '../assets/instagram.png';

const LandingNew: React.FC = () => {
  const [typedText, setTypedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();

  const words = ['Plumbers', 'Electricians', 'Carpenters', 'Painters', 'Workers'];

  useEffect(() => {
    // Redirect authenticated users
    if (isAuthenticated && user) {
      if (user.role === 'user') {
        navigate('/user/dashboard');
      } else if (user.role === 'worker') {
        navigate('/worker/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Typing animation effect
  useEffect(() => {
    const word = words[currentWordIndex];
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex <= word.length) {
        setTypedText(word.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }, 2000);
      }
    }, 150);

    return () => clearInterval(typingInterval);
  }, [currentWordIndex]);

  // Stats data
  const stats = [
    { number: '10K+', label: 'Active Users', icon: Users },
    { number: '5K+', label: 'Verified Workers', icon: Briefcase },
    { number: '50K+', label: 'Jobs Completed', icon: CheckCircle },
    { number: '4.9/5', label: 'Avg Rating', icon: Star },
  ];

  // Features data
  const features = [
    {
      title: 'AI-Powered Matching',
      description: 'Our advanced algorithm connects you with the perfect worker for your needs.',
      icon: Zap,
      image: drone,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Real-Time Tracking',
      description: 'Track your worker location and status in real-time with live updates.',
      icon: MapPin,
      image: locationImg,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with multiple payment options.',
      icon: Shield,
      image: dollarSymbol,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you whenever you need help.',
      icon: Heart,
      image: womenCustomerSupport,
      color: 'from-pink-500 to-rose-500'
    },
  ];

  // Services data
  const services = [
    { name: 'Plumbing', image: mainHoldingBoxService, jobs: '5K+' },
    { name: 'Electrical', image: manWithHeadphones, jobs: '4K+' },
    { name: 'Carpentry', image: house, jobs: '3K+' },
    { name: 'Painting', image: mansion, jobs: '2K+' },
    { name: 'Cleaning', image: penguin, jobs: '6K+' },
    { name: 'More', image: cuteAvocado, jobs: '10K+' },
  ];

  // How it works
  const steps = [
    {
      step: '01',
      title: 'Post Your Requirement',
      description: 'Tell us what service you need and your location.',
      image: handHoldingMap
    },
    {
      step: '02',
      title: 'Get Matched',
      description: 'Our AI finds the best workers near you instantly.',
      image: bullseye
    },
    {
      step: '03',
      title: 'Connect & Hire',
      description: 'Review profiles, chat, and hire the perfect worker.',
      image: shakehand
    },
    {
      step: '04',
      title: 'Job Complete',
      description: 'Get your work done and pay securely through the app.',
      image: treasure
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Navbar />
      
      {/* Hero Section with Multi-layer Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 left-10 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-40 right-10 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, 50, 0]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 left-1/3 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{ 
              scale: [1, 1.1, 1],
              x: [0, 30, 0],
              y: [0, -40, 0]
            }}
            transition={{ duration: 12, repeat: Infinity }}
          />
        </div>

        {/* Parallax Images */}
        <motion.div 
          className="absolute top-20 left-10 opacity-50"
          style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '100%']) }}
        >
          <img src={balloons} alt="decoration" className="w-32 h-32 object-contain" />
        </motion.div>
        <motion.div 
          className="absolute bottom-20 right-10 opacity-50"
          style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-100%']) }}
        >
          <img src={stars} alt="decoration" className="w-40 h-40 object-contain" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <img src={mainLogo} alt={APP_NAME} className="w-8 h-8 object-contain" />
                <span className="text-sm font-semibold text-gray-700">Trusted by 10,000+ Users</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 mb-6">
                Find Expert <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-yellow-600 to-green-600 bg-size-200 animate-gradient">
                  {typedText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1 h-16 bg-green-600 ml-2"
                  />
                </span>
                <br />
                Near You
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-xl">
                Connect with skilled professionals for all your home service needs. Fast, reliable, and just a tap away.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto group">
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                </motion.div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[girlInJoy, manHoldingMobile, womenCustomerSupport].map((img, i) => (
                      <img key={i} src={img} alt="user" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 font-medium">5.0 Rating</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative z-10"
              >
                <img src={manHoldingMobile} alt="Hero" className="w-full max-w-lg mx-auto drop-shadow-2xl" />
              </motion.div>
              
              {/* Floating Elements */}
              <motion.img
                src={girlInJoy}
                alt="decoration"
                className="absolute top-10 -right-10 w-32 h-32 object-contain"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 10, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.img
                src={unityPeople}
                alt="decoration"
                className="absolute bottom-10 -left-10 w-40 h-40 object-contain"
                animate={{ 
                  y: [0, 15, 0],
                  rotate: [0, -10, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex items-start justify-center p-2">
            <motion.div 
              className="w-1.5 h-1.5 bg-gray-600 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Marquee Section - Tech Stack/Achievements */}
      <section className="bg-gradient-to-r from-green-600 to-yellow-600 py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="flex items-center gap-12 mx-6">
              {['AI Powered', '10K+ Users', 'Real-Time Tracking', 'Secure Payments', '24/7 Support', 'Verified Workers'].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-white fill-white" />
                  <span className="text-white font-bold text-xl">{text}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* About/Overview Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Your Trusted Partner for
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-600"> Home Services</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {APP_NAME} is revolutionizing the way you find and hire skilled workers. Our platform connects you with verified professionals for all your home service needs, from plumbing and electrical work to carpentry and beyond.
              </p>
              <div className="space-y-4">
                {[
                  'AI-powered worker matching for perfect fits',
                  'Background-verified professionals you can trust',
                  'Transparent pricing with no hidden costs',
                  'Real-time tracking and updates',
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              {[mobilFingerprint, socialMedia, groupOfCoins, handHoldingMap].map((img, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                  className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-green-100 to-yellow-100 p-4"
                >
                  <img src={img} alt="feature" className="w-full h-48 object-contain" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to find, hire, and manage workers efficiently
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Browse Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find skilled professionals for any job
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get your work done in four simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <HowItWorksCard key={index} {...step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-yellow-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Get In Touch
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Have questions? We're here to help you 24/7.
              </p>

              <div className="space-y-6">
                <ContactInfo 
                  icon={Phone}
                  label="Phone"
                  value="9059817018"
                  href="tel:9059817018"
                />
                <ContactInfo 
                  icon={Mail}
                  label="Email"
                  value="rajuchaswik@gmail.com"
                  href="mailto:rajuchaswik@gmail.com"
                />
                <ContactInfo 
                  icon={MapPinIcon}
                  label="Address"
                  value="Dno-6/4/836, Ram Nagar, Maruthi Nagar, Ananthapur, Andhra Pradesh – 515001"
                />
              </div>

              <div className="mt-8">
                <p className="text-white/90 mb-4">Connect with us:</p>
                <div className="flex gap-4">
                  {[
                    { icon: instagramIcon, name: 'Instagram' },
                    { icon: socialMedia, name: 'Facebook' },
                  ].map((social, i) => (
                    <motion.a
                      key={i}
                      href="#"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                    >
                      <img src={social.icon} alt={social.name} className="w-6 h-6 object-contain" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
                <textarea
                  rows={4}
                  placeholder="Your Message"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"
                />
                <Button variant="primary" size="lg" className="w-full">
                  Send Message
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of satisfied users and workers on {APP_NAME}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register">
                  <Button variant="primary" size="lg">
                    Sign Up Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
                    Login
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Component: Stats Card
const StatsCard: React.FC<{ number: string; label: string; icon: any; index: number }> = ({ number, label, icon: Icon, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1 }}
      className="text-center p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-yellow-600 rounded-full mb-4 shadow-lg">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-4xl font-bold text-gray-900 mb-2">{number}</h3>
      <p className="text-gray-600 font-medium">{label}</p>
    </motion.div>
  );
};

// Component: Feature Card
const FeatureCard: React.FC<{ title: string; description: string; icon: any; image: string; color: string; index: number }> = 
  ({ title, description, icon: Icon, image, color, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      <div className="p-6">
        <div className="relative h-40 mb-4 flex items-center justify-center">
          <img src={image} alt={title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${color} rounded-xl mb-4 shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

// Component: Service Card
const ServiceCard: React.FC<{ name: string; image: string; jobs: string; index: number }> = ({ name, image, jobs, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="p-6 text-center">
        <div className="relative h-24 mb-4 flex items-center justify-center">
          <img src={image} alt={name} className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-300" />
        </div>
        <h3 className="font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-gray-600">{jobs} jobs</p>
      </div>
    </motion.div>
  );
};

// Component: How It Works Card
const HowItWorksCard: React.FC<{ step: string; title: string; description: string; image: string; index: number }> = 
  ({ step, title, description, image, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15 }}
      className="relative"
    >
      <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
        <div className="text-6xl font-bold text-green-100 mb-4">{step}</div>
        <div className="relative h-32 mb-4 flex items-center justify-center">
          <img src={image} alt={title} className="w-full h-full object-contain" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      {index < 3 && (
        <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
          <ArrowRight className="w-8 h-8 text-green-600" />
        </div>
      )}
    </motion.div>
  );
};

// Component: Contact Info
const ContactInfo: React.FC<{ icon: any; label: string; value: string; href?: string }> = 
  ({ icon: Icon, label, value, href }) => {
  const content = (
    <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all">
      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-white/80 text-sm mb-1">{label}</p>
        <p className="text-white font-semibold">{value}</p>
      </div>
    </div>
  );

  return href ? <a href={href}>{content}</a> : content;
};

export default LandingNew;
