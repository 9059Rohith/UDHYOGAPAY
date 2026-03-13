# UdhyogaPay - Hyperlocal Worker Booking Platform

UdhyogaPay is a full-stack web platform for connecting users with nearby skilled workers such as plumbers, electricians, carpenters, cleaners, and painters. It supports worker discovery, booking lifecycle management, OTP-based job start, real-time updates, ratings, KYC workflow, and admin monitoring.

## Student Details

- Name: Rohith Kumar Dhamagatla
- Roll No: CB.SC.U4CSE23018N

## Project Status

This repository currently contains:

- `frontend/` - React + TypeScript web app
- `backend/` - Node.js + Express + TypeScript API
- `ai_engine/` - Worker ranking microservice
- `shared/` - Shared service/type utilities
- `submission/codefile_db/` - Database schemas, seeders, migration index script

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Leaflet.js, Socket.io client, Axios
- Backend: Node.js, Express, TypeScript, Socket.io, JWT, bcrypt, Joi, Helmet, rate limit
- Database: MongoDB Atlas + Mongoose (with geospatial indexes)
- Media: Cloudinary
- Maps and Geo: Nominatim (geocoding), OSRM (routing), Haversine fallback
- Payments: Razorpay integration structure (requires valid keys for live usage)

## Folder Structure

```text
udhyogapay/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
  frontend/
    src/
      components/
      context/
      pages/
      services/
      types/
      utils/
  ai_engine/
    src/
      algorithms/
      types/
      utils/
  shared/
  submission/
    codefile_db/
      db_config.ts
      schemas/
      seeds/
      migrations/
```

## Core Features

- Secure registration/login with JWT auth
- Role-based access: User, Worker, Admin
- Worker discovery using geospatial queries (`2dsphere`)
- Matching score based on:
  - Distance: 50%
  - Rating: 30%
  - Experience: 20%
- Real-time booking updates with Socket.io
- OTP verification before job start
- Booking lifecycle: pending -> accepted/rejected -> started -> completed/cancelled
- Ratings and feedback workflow
- Worker KYC approval flow
- Admin analytics and moderation endpoints

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas URI (or local MongoDB)
- Cloudinary account (for uploads)

## Environment Setup

Create `.env` files for each service.

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/udhyogapay
JWT_SECRET=replace_with_secure_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
EMAIL_USER=your_email
EMAIL_PASSWORD=app_password
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### AI Engine (`ai_engine/.env`)

```env
PORT=5002
NODE_ENV=development
```

## Local Development

Open three terminals from repository root.

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

### 2. AI Engine

```bash
cd ai_engine
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Build Commands

### Backend

```bash
cd backend
npm run build
npm start
```

### AI Engine

```bash
cd ai_engine
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
npm run preview
```

## Database Files in `submission/codefile_db`

This folder is prepared for DB-only submission requirements.

### Included files

- `db_config.ts`
  - MongoDB connection with retry logic and pooling options
- `schemas/user.schema.ts`
  - Full User schema, validations, indexes, virtuals, password hashing
- `schemas/worker.schema.ts`
  - Worker schema with KYC fields, earnings, and `2dsphere` geospatial index
- `schemas/booking.schema.ts`
  - Booking schema with OTP, timeline, status enum, rating subdocument
- `seeds/seedUsers.ts`
  - Seeds 10 sample Indian users
- `seeds/seedWorkers.ts`
  - Seeds 10 workers across 5 professions
- `seeds/seedBookings.ts`
  - Seeds 20 bookings with varied statuses
- `migrations/createIndexes.ts`
  - Programmatic index creation script

### Seed execution order

```bash
cd submission/codefile_db
# Run in this order using ts-node in your configured environment:
# 1) seedUsers.ts
# 2) seedWorkers.ts
# 3) seedBookings.ts
# 4) migrations/createIndexes.ts (or before seed if preferred)
```

## API Summary

Base URL: `http://localhost:5000/api`

- Auth: `/auth/register`, `/auth/login`, `/auth/logout`
- User: worker search, geocode/reverse geocode, profile operations
- Worker: profile, availability, location, KYC flow
- Booking: create, accept/reject, start (OTP), complete
- Admin: KYC verify, dashboard metrics

## Deployment Notes

Recommended setup:

- Backend: Railway
- AI Engine: Railway (separate service)
- Frontend: Netlify
- Database: MongoDB Atlas
- Media: Cloudinary

Before deployment:

1. Confirm all env vars are set.
2. Ensure MongoDB network access is open for deployment hosts.
3. Run local build for backend/frontend/ai_engine.
4. Verify CORS origin values match deployed frontend domain.

## Troubleshooting Quick Notes

- If login fails with 401, verify JWT secret consistency and cookie settings.
- If map shows no workers, confirm worker `isOnline=true`, `isVerified=true`, and valid `currentLocation.coordinates`.
- If uploads fail, verify Cloudinary credentials.
- If booking updates are not real-time, verify Socket.io URL and CORS settings.

## License

Academic project repository for demonstration and evaluation.
