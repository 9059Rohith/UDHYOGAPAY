// Backend comment: index
import express, { Application } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Import configurations
import connectDatabase from './config/database';
import { configureCloudinary } from './config/cloudinary';
import { initializeSocket } from './services/socketService';
import { errorMiddleware } from './utils/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import workerRoutes from './routes/workers';
import userRoutes from './routes/users';
import bookingRoutes from './routes/bookings';
import adminRoutes from './routes/admin';
import workerApplicationRoutes from './routes/workerApplications';
import matchingRoutes from './routes/matching';
import chatRoutes from './routes/chat';
import reviewRoutes from './routes/reviews';
import payoutRoutes from './routes/payouts';
import serviceCategoryRoutes from './routes/serviceCategories';
import complaintRoutes from './routes/complaints';
import accountDeletionRoutes from './routes/accountDeletion';
import paymentRoutes from './routes/payments';

// Initialize express app
const app: Application = express();
const server = http.createServer(app);

// Connect to database
connectDatabase();

// Configure Cloudinary
configureCloudinary();

// Initialize Socket.io
const io = initializeSocket(server);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve uploads folder
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/worker-applications', workerApplicationRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/service-categories', serviceCategoryRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/account-deletion', accountDeletionRoutes);
app.use('/api/payments', paymentRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Udhyoga Pay API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      workers: '/api/workers',
      users: '/api/users',
      reviews: '/api/reviews',
      payouts: '/api/payouts',
      serviceCategories: '/api/service-categories',
      bookings: '/api/bookings',
      matching: '/api/matching',
      admin: '/api/admin'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Udhyoga Pay Server Running                      ║
║   📡 Port: ${PORT}                                   ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}               ║
║   📊 Database: Connected                              ║
║   ⚡ Socket.io: Active                                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log('❌ Unhandled Rejection! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

export default app;
