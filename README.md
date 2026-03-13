
# Udhyoga Pay - Worker Booking Platform

A production-ready full-stack web application for booking professional workers (plumbers, electricians, carpenters, etc.) with real-time location tracking, geospatial search, and instant notifications.


CB.SC.U4CSE23018=>Rohith kumar Dhamagatla

## 🚀 Features

### User Portal
- 🗺️ **Interactive Map** - Find workers on OpenStreetMap with custom markers
- 📍 **Geolocation** - Automatic location detection and geocoding
- 🔍 **Smart Search** - Find workers by profession within 5km radius
- 📊 **Multi-factor Ranking** - Workers ranked by distance, rating, and experience
- 🚗 **Route Display** - See exact route and ETA using OSRM
- 🔔 **Real-time Updates** - Instant booking status notifications
- 🔐 **OTP Verification** - Secure job start verification

### Worker Portal
- 🟢 **Online/Offline Toggle** - Control availability with one click
- 📱 **GPS Tracking** - Automatic location updates every 30 seconds
- ⏱️ **30-Second Window** - Accept/reject bookings with countdown timer
- 📄 **KYC Upload** - Aadhar and Police Verification documents
- 💰 **Earnings Dashboard** - Track jobs, ratings, and statistics
- 🔔 **Push Notifications** - Browser notifications for new bookings

### Admin Dashboard
- 📊 **Analytics** - Users, workers, bookings, revenue metrics
- ✅ **Worker Verification** - Approve/reject KYC documents
- 🗺️ **Live Map** - Real-time view of all active workers
- 📈 **Distribution Charts** - Worker distribution by profession
- 📋 **Booking Management** - View and filter all platform bookings

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Routing**: React Router v6
- **Styling**: TailwindCSS 4
- **Maps**: Leaflet.js + React-Leaflet
- **Map Tiles**: OpenStreetMap (free)
- **Real-time**: Socket.io Client
- **HTTP**: Axios
- **State**: Context API + Zustand (optional)
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with httpOnly cookies
- **Real-time**: Socket.io Server
- **File Upload**: Multer + Cloudinary
- **Geocoding**: Nominatim (OpenStreetMap)
- **Routing**: OSRM / OpenRouteService
- **Validation**: Joi
- **Security**: Helmet.js, Rate Limiting, bcrypt

### APIs & Services
- **OpenStreetMap Nominatim** - Free geocoding
- **OSRM** - Free route calculation
- **Cloudinary** - Document storage
- **MongoDB Atlas** - Database hosting (free tier)
- **Browser Geolocation API** - User/worker location

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# Required: MONGODB_URI, JWT_SECRET, CLOUDINARY credentials

# Start MongoDB
mongod

# Run development server
npm run dev

# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:5000
# VITE_SOCKET_URL=http://localhost:5000

# Run development server
npm run dev

# App runs on http://localhost:5173
```

## 🗄️ Database Setup

MongoDB will auto-create collections and indexes. No manual setup required.

### Collections
- `users` - User accounts (all roles)
- `workers` - Worker profiles and KYC docs
- `bookings` - Booking records with timeline

### Indexes (Auto-created)
- Geospatial 2dsphere index on worker locations
- Unique indexes on email and phone
- Compound indexes for optimized queries

## 🔑 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/udhyogapay
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# Cloudinary (sign up at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin
ADMIN_EMAIL=rajuchaswik@gmail.com

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🚀 Usage

### 1. Register as User or Worker
- Go to `/register`
- Choose role: User or Worker
- Fill in details and submit

### 2. User Flow
1. Login → Redirected to `/user/home`
2. Allow location access
3. Select profession (plumber, electrician, etc.)
4. View workers on map with ratings and distance
5. Click on a worker marker to see details
6. Click "Book Now" to create booking
7. Receive OTP to share with worker
8. Track booking status in real-time

### 3. Worker Flow
1. Login → Redirected to `/worker/dashboard`
2. Complete KYC verification (if first time)
3. Wait for admin approval
4. Toggle "Online" to receive bookings
5. Accept/Reject bookings within 30 seconds
6. Enter user's OTP to start job
7. Complete job when done

### 4. Admin Flow
1. Login with admin email (rajuchaswik@gmail.com)
2. View platform analytics
3. Approve/reject pending worker verifications
4. View live map of active workers
5. Monitor all bookings

## 📡 API Documentation

### Authentication
- `POST /api/auth/register` - Register user/worker
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify-token` - Verify JWT

### Workers
- `POST /api/workers/kyc` - Upload KYC documents
- `PATCH /api/workers/toggle-online` - Toggle availability
- `PATCH /api/workers/location` - Update GPS location
- `GET /api/workers/profile` - Get worker profile

### Users
- `POST /api/users/workers/nearby` - Find nearby workers
- `POST /api/users/geocode` - Address to coordinates
- `POST /api/users/reverse-geocode` - Coordinates to address
- `POST /api/users/calculate-distance` - Route distance

### Bookings
- `POST /api/bookings/create` - Create booking
- `PATCH /api/bookings/:id/accept` - Accept (worker)
- `PATCH /api/bookings/:id/reject` - Reject (worker)
- `POST /api/bookings/:id/verify-otp` - Start job
- `PATCH /api/bookings/:id/complete` - Complete job
- `PATCH /api/bookings/:id/rate` - Rate worker
- `GET /api/bookings/history` - User history
- `GET /api/bookings/worker/history` - Worker history

### Admin
- `GET /api/admin/workers/pending` - Pending verifications
- `PATCH /api/admin/workers/:id/verify` - Verify worker
- `GET /api/admin/workers/active` - Live workers
- `GET /api/admin/analytics` - Platform analytics

## 🗺️ Map Integration

### OpenStreetMap Services (All Free!)

1. **Nominatim** (Geocoding)
   - Address → Coordinates
   - Coordinates → Address
   - Rate limit: 1 request/second
   - No API key required

2. **OSRM** (Routing)
   - Calculate route distance and duration
   - Get route geometry for map display
   - Public demo server available
   - Can self-host for production

3. **OpenStreetMap Tiles**
   - Free map tiles
   - Unlimited usage
   - Multiple styles available

### Worker Ranking Algorithm

```javascript
// Multi-factor scoring (0-5 scale)
finalScore = (
  distanceScore * 0.5 +  // 50% weight
  ratingScore * 0.3 +    // 30% weight
  experienceScore * 0.2  // 20% weight
)

// Workers sorted by finalScore (highest first)
```

## 🔐 Security Features

- ✅ JWT with httpOnly cookies
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Rate limiting (100 req/15min)
- ✅ Input validation with Joi
- ✅ CORS whitelist
- ✅ Helmet.js security headers
- ✅ MongoDB injection prevention
- ✅ File upload validation (5MB max, PDF/JPG only)
- ✅ Admin email verification

## 📱 Real-time Features

### Socket.io Events

**User Room**
- Booking accepted
- Booking rejected
- Job started
- Job completed

**Worker Room**
- New booking request
- Location update request

**Admin Room**
- Worker location updates
- Booking status changes

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Strategy
1. API endpoints with Postman
2. Socket.io events with Socket.io Explorer
3. Map functionality in different browsers
4. Geolocation on mobile devices
5. Real-time notifications

## 📈 Production Deployment

### Backend (Railway / Render)
1. Push code to GitHub
2. Connect repository
3. Add environment variables
4. Deploy

### Frontend (Vercel / Netlify)
```bash
npm run build
vercel deploy --prod
```

### Database (MongoDB Atlas)
1. Create free cluster
2. Get connection string
3. Update MONGODB_URI

### Cloudinary
1. Sign up at cloudinary.com
2. Get credentials from dashboard
3. Update .env variables

## 🌍 Browser Support

- Chrome/Edge ✅
- Firefox ✅
- Safari ✅
- Mobile browsers ✅

**Note**: HTTPS required in production for Geolocation API

## 📊 Performance

- MongoDB geospatial indexes for fast queries
- Socket.io for low-latency updates
- React lazy loading for code splitting
- Optimized map rendering
- Debounced location updates

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

ISC

## 👨‍💻 Author

Udhyoga Pay Development Team

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@udhyogapay.com

---

**Built with ❤️ using React, Node.js, and OpenStreetMap**

