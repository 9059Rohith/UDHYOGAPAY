# UdhyogaPay — Hyperlocal Marketplace for Service Workers and Users

> **Academic Year 2025–2026 | Amrita School of Computing, Amrita Vishwa Vidyapeetham, Coimbatore**

UdhyogaPay is a production-grade, full-stack hyperlocal marketplace platform that connects skilled service workers (plumbers, electricians, carpenters, cleaners, painters, AC technicians) with users who need on-demand services. It features AI-assisted multi-factor worker ranking, real-time Socket.io booking updates, geospatial worker discovery with MongoDB `2dsphere` indexes, KYC verification pipeline, role-based access control, Cloudinary media management, JWT authentication with httpOnly cookies, and a complete admin governance dashboard.

---

## Team Details

| Name | Roll Number | Role |
|---|---|---|
| **Rohith Kumar Dhamagatla** | CB.SC.U4CSE23018 | Backend Lead — Auth, Matching, Reviews, User Module |
| C. Kalyan Kumar Reddy | CB.SC.U4CSE23060 | Database & QA Lead |
| T. Venkataramana | CB.SC.U4CSE23055 | Frontend Lead |
| VAB Jashwanth Reddy | CB.SC.U4CSE23058 | Mobile & Integration |

- **Guide:** T. Senthil Kumar
- **Team No:** 02
- **GitHub (Rohith):** https://github.com/9059Rohith

---

## Repository Structure

```text
udhyogapay/
├── backend/                        # Node.js + Express + TypeScript API (Port 5000)
│   └── src/
│       ├── config/
│       │   ├── cloudinary.ts       # Cloudinary SDK init and upload helpers
│       │   ├── constants.ts        # App-wide constants (roles, statuses)
│       │   └── database.ts         # MongoDB Atlas connection with retry + pooling
│       ├── controllers/
│       │   ├── authController.ts       # Register, login, JWT, password reset
│       │   ├── userController.ts       # User CRUD, saved addresses, location update
│       │   ├── workerController.ts     # KYC pipeline, availability, earnings, location
│       │   ├── bookingController.ts    # Full booking lifecycle + Socket.io events
│       │   ├── matchingController.ts   # Geospatial search + AI engine call
│       │   ├── reviewController.ts     # Review CRUD + post-save rating aggregation
│       │   ├── adminController.ts      # KYC approvals, analytics, user management
│       │   ├── paymentController.ts    # Razorpay order + verify + cash recording
│       │   ├── payoutController.ts     # Worker payout requests
│       │   ├── chatController.ts       # In-booking chat persistence
│       │   ├── complaintController.ts  # Complaint filing and moderation
│       │   ├── notificationController.ts
│       │   ├── serviceCategoryController.ts
│       │   └── accountDeletionController.ts
│       ├── middleware/
│       │   ├── auth.ts             # JWT protect middleware (httpOnly cookie or Bearer)
│       │   ├── roleCheck.ts        # isUser / isWorker / isAdmin guards
│       │   └── upload.ts           # Multer + Cloudinary storage adapter (5 MB, image only)
│       ├── models/                 # Mongoose schemas (User, Worker, Booking, Review, ...)
│       ├── routes/                 # Express routers per domain
│       ├── services/               # razorpayService, emailService, osmService
│       ├── scripts/                # Seed and admin setup scripts
│       └── utils/                  # Helper functions
│
├── ai_engine/                      # Worker ranking microservice (Port 5002)
│   └── src/
│       ├── algorithms/
│       │   └── matchingEngine.ts   # Multi-factor scoring + Haversine fallback
│       ├── types/
│       └── utils/
│
├── frontend/                       # React 19 + TypeScript SPA (Vite, Port 5173)
│   └── src/
│       ├── components/             # Reusable UI: MapView, BookingModal, ReviewForm, etc.
│       ├── context/                # AuthContext (JWT user state + localStorage sync)
│       ├── pages/                  # Route-level page components
│       ├── services/               # Axios API client wrappers
│       ├── types/                  # TypeScript interfaces (IUser, IWorker, IBooking...)
│       └── utils/                  # Date formatters, validators, helpers
│
├── shared/                         # Shared TypeScript types + API service + utils
│   ├── types/index.ts
│   ├── services/api.ts
│   └── utils/index.ts
│
├── mobile/                         # React Native + Expo mobile app (separate deployment)
│
└── submission/
    └── codefile_db/                # DB-only submission package
        ├── db_config.ts
        ├── schemas/
        │   ├── user.schema.ts
        │   ├── worker.schema.ts
        │   └── booking.schema.ts
        ├── seeds/
        │   ├── seedUsers.ts
        │   ├── seedWorkers.ts
        │   └── seedBookings.ts
        └── migrations/
            └── createIndexes.ts
```

---

## Technology Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express.js | 4.x | HTTP framework |
| TypeScript | 5.x | Type-safe backend |
| Mongoose | 8.x | MongoDB ODM with geospatial support |
| Socket.io | 4.x | Real-time WebSocket server |
| jsonwebtoken | 9.x | JWT issuance and verification |
| bcrypt | 5.x | Password hashing (cost factor 12) |
| Joi | 17.x | Request body validation |
| Helmet.js | 7.x | HTTP security headers |
| express-rate-limit | 7.x | Brute-force protection (100 req/15 min) |
| express-mongo-sanitize | 2.x | NoSQL injection prevention |
| multer | 1.x | Multipart file upload handling |
| cloudinary | 2.x | Cloud media storage SDK |
| nodemailer | 6.x | Password reset / notification emails |
| cors | 2.x | Cross-origin request control |
| cookie-parser | 1.x | httpOnly cookie parsing |

### Frontend
| Package | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool / dev server |
| Tailwind CSS | Utility-first styling |
| react-leaflet + Leaflet.js | Interactive map (OpenStreetMap tiles) |
| Socket.io-client | Real-time booking updates |
| Axios | HTTP API client |
| react-hook-form + Zod | Form management + client-side validation |
| Recharts | Earnings bar/line charts |
| react-hot-toast | Toast notifications |
| zustand | UI state management |

### AI Engine
| Package | Purpose |
|---|---|
| Node.js + Express + TypeScript | Microservice runtime |
| Custom scoring algorithm | Distance + Rating + Experience + Skill + Urgency weighting |

### Infrastructure
| Service | Platform |
|---|---|
| Backend API | Railway (Node.js container) |
| AI Engine | Railway (separate service) |
| Frontend SPA | Netlify (static CDN) |
| Database | MongoDB Atlas M0 (Mumbai region) |
| Media Storage | Cloudinary (free tier, 25 GB) |

---

## Core Features

### User Features
- Secure registration and login with JWT stored in httpOnly cookies
- Password reset via SHA-256 hashed email token (10-minute expiry)
- Geospatial worker search by profession, distance, urgency, rating, and skills
- Interactive Leaflet.js map with AI-ranked worker markers (green > 75 score, amber 50–75, red < 50)
- OSRM route overlay from user location to selected worker
- Full booking lifecycle — create, track, cancel, rate
- Saved address book (max 5) with single-default enforcement
- Real-time booking status notifications via Socket.io

### Worker Features
- Self-service KYC registration — profile photo, government ID, address proof, skill certifications uploaded to Cloudinary
- Online/offline availability toggle with GPS location sync
- Accept or reject incoming booking requests
- Status updates: `pending → accepted → in-progress → completed`
- Worker dashboard with KPI cards: Today's bookings, Total earnings, Average rating, Completion rate
- Monthly earnings chart (Recharts BarChart) via MongoDB aggregation
- Payout request management

### Admin Features
- KYC verification — approve or reject with stored rejection reasons
- User and worker management — suspend, reinstate, role change
- Executive analytics dashboard — total bookings, revenue, registrations, category breakdown
- Complaint management workflow with status trail
- Review moderation — flag and delete policy-violating reviews
- Platform-wide Socket.io monitoring

### Real-time (Socket.io)
| Event | Direction | Room | Purpose |
|---|---|---|---|
| `booking:new` | Server → Worker | `worker_{id}` | New booking request notification |
| `booking:statusUpdate` | Server → Both | `booking_{id}` | Status change + timestamp |
| `booking:accepted` | Server → User | `booking_{id}` | Acceptance with ETA |
| `booking:cancelled` | Server → Both | `booking_{id}` | Cancellation with reason |
| `payment:confirmed` | Server → Both | `booking_{id}` | Transaction ID + amount |
| `worker:locationUpdate` | Client → Server | global | Live GPS coordinate push |
| `chat:message` | Client → Server | `booking_{id}` | In-booking chat send |
| `chat:receive` | Server → Both | `booking_{id}` | Persisted chat message |
| `notification:push` | Server → User | `user_{id}` | Generic platform notification |

---

## AI Worker Ranking Algorithm

The AI Matching Engine (`ai_engine/src/algorithms/matchingEngine.ts`) ranks workers using a transparent, weighted multi-factor formula:

**Distance Score:**
```
D(w) = (1 - distance_km / maxDistance) × 100
```

**Rating Score:**
```
R(w) = (workerRating / 5) × 100
```

**Experience Score:**
```
E(w) = min(yearsExperience / 10, 1) × 100
```

**Skill Match Bonus:**
```
SkillBonus(w) = (matchingSkills / requestedSkills) × 10
```

**Urgency Multiplier:**
```
U = 1.0 (Low) | 1.2 (Medium) | 1.5 (High)
```

**Final Score:**
```
MatchScore = (0.50 × D + 0.30 × R + 0.20 × E + SkillBonus) × U
```

On AI engine timeout or unavailability, `matchingController.ts` automatically falls back to pure Haversine distance sorting.

---

## Database Schema Overview

### Users Collection
- Fields: `name`, `email` (unique), `phone` (unique, 10-digit), `password` (bcrypt-12), `role` (user/worker/admin), `location` (GeoJSON Point, 2dsphere indexed), `isActive`, `resetPasswordToken`, `resetPasswordExpire`
- Hooks: `pre-save` bcrypt hash, `getResetPasswordToken()` instance method

### Workers Collection
- Fields: `userId` (ref User), `profession`, `skills[]`, `experience`, `hourlyRate`, `serviceRadius`, `currentLocation` (GeoJSON, 2dsphere), `isOnline`, `isVerified`, `rating`, `completedBookings`, `kycDocuments[]`
- Indexes: 2dsphere on `currentLocation`, compound on `{profession, isOnline, isVerified}`

### Bookings Collection
- Fields: `user` (ref), `worker` (ref), `serviceType`, `status` (pending/accepted/in-progress/completed/cancelled), `pricing`, `paymentStatus`, `paymentMethod`, `scheduledDate`, `location` (GeoJSON), `description`, `timeline` (Map of timestamps)
- Indexes: 2dsphere on `location`, compound on `{user, status}`, `{worker, status}`

### Reviews Collection
- Fields: `booking` (unique ref), `user`, `worker`, `rating`, `title`, `comment`, sub-ratings (quality, punctuality, cleanliness)
- Hook: `post-save` aggregation pipeline automatically recalculates `workers.rating` via `$group + $avg`

### Other Collections
`transactions`, `savedaddresses`, `notifications`, `chatmessages`, `complaints`, `searchhistory`, `usersessions`

---

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas account (free M0 tier works)
- Cloudinary account (free tier, 25 GB)
- Gmail account with App Password enabled (for email notifications)

---

## Environment Setup

### Backend — `backend/.env`

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/udhyogapay?appName=Cluster0
JWT_SECRET=udhyogapay-super-secret-key-2026
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin
ADMIN_EMAIL=your_admin@gmail.com

# Email (Gmail + App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=xxxx_xxxx_xxxx_xxxx

# AI Engine
AI_ENGINE_URL=http://localhost:5002

# CORS
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Razorpay (optional — leave placeholder for demo mode)
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

> **Note:** Never commit `.env` to Git. It is already listed in `.gitignore`. Use Railway/Netlify environment variable panels for production secrets.

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### AI Engine — `ai_engine/.env`

```env
PORT=5002
NODE_ENV=development
```

---

## Local Development Setup

Run each service in a separate terminal from the repository root.

### 1. Backend

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### 2. AI Matching Engine

```bash
cd ai_engine
npm install
npm run dev
# Runs on http://localhost:5002
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

All three services must be running simultaneously for full functionality.

---

## Build for Production

### Backend
```bash
cd backend
npm run build      # compiles TypeScript → dist/
npm start          # runs dist/index.js
```

### AI Engine
```bash
cd ai_engine
npm run build
node dist/index.js
```

### Frontend
```bash
cd frontend
npm run lint       # ESLint check (must be zero errors)
npm run build      # Vite build → dist/
npm run preview    # Preview production build locally
```

TypeScript strict-mode validation:
```bash
# From root — verify all three projects pass tsc
npx tsc -b backend/tsconfig.json --noEmit
npx tsc -b frontend/tsconfig.json --noEmit
npx tsc -b ai_engine/tsconfig.json --noEmit
```

---

## Complete API Reference

Base URL (local): `http://localhost:5000/api`

All protected endpoints require a valid JWT cookie set at login. All responses follow the envelope:
```json
{ "success": true, "message": "...", "data": { ... } }
```

### Authentication — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | None | Register user or worker — sets httpOnly JWT cookie |
| POST | `/auth/login` | None | Login — sets httpOnly JWT cookie |
| GET | `/auth/logout` | JWT | Clears JWT cookie |
| GET | `/auth/profile` | JWT | Get current user profile |
| PATCH | `/auth/update-password` | JWT | Change password (requires currentPassword) |
| POST | `/auth/forgot-password` | None | Sends reset token to email (10-min expiry) |
| POST | `/auth/reset-password/:token` | None | Validates token and sets new password |

### Users — `/api/users`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users/profile` | JWT User | Get full profile |
| PATCH | `/users/profile` | JWT User | Update name, phone, location |
| GET | `/users/saved-addresses` | JWT User | List saved addresses |
| POST | `/users/saved-addresses` | JWT User | Add address (max 5 enforced) |
| PATCH | `/users/saved-addresses/:id` | JWT User | Update address |
| DELETE | `/users/saved-addresses/:id` | JWT User | Delete address |

### Worker Matching — `/api/matching`
| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/matching/find` | JWT | `serviceType, userLocation, urgency, maxDistance, minRating, skills[]` | AI-ranked geospatial search |
| GET | `/matching/search-history` | JWT | — | Recent search history |

**Sample request body:**
```json
{
  "serviceType": "plumber",
  "userLocation": { "latitude": 14.6819, "longitude": 77.5931 },
  "urgency": "high",
  "maxDistance": 25,
  "minRating": 3.5,
  "skills": []
}
```

### Workers — `/api/workers`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/workers/apply` | JWT User | Submit KYC application (multipart/form-data) |
| GET | `/workers/profile` | JWT Worker | Get worker profile |
| PATCH | `/workers/profile` | JWT Worker | Update hourly rate, skills, bio, service radius |
| PATCH | `/workers/availability` | JWT Worker | Toggle `isOnline` + push location |
| PATCH | `/workers/location` | JWT Worker | Update live GPS coordinates |
| GET | `/workers/earnings` | JWT Worker | Monthly earnings aggregation |
| GET | `/workers/bookings` | JWT Worker | Booking history (filter by status) |

### Bookings — `/api/bookings`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/bookings` | JWT User | Create booking (emits `booking:new` Socket.io event) |
| GET | `/bookings/history` | JWT | Paginated history with status/date filters |
| GET | `/bookings/:id` | JWT | Single booking with populated user + worker |
| PATCH | `/bookings/:id/status` | JWT Worker/Admin | State machine transition |
| POST | `/bookings/:id/cancel` | JWT | Cancel with reason |

**Booking status state machine:**
```
pending → accepted  → in-progress → completed
        ↘ cancelled
```

### Reviews — `/api/reviews`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/reviews` | JWT User | Submit review (unique per booking; triggers rating recalculation) |
| GET | `/reviews/worker/:workerId` | JWT | All reviews for a worker |
| GET | `/reviews/booking/:bookingId` | JWT | Review for a specific booking |
| PATCH | `/reviews/:id` | JWT User | Update own review |
| DELETE | `/reviews/:id` | JWT Admin | Remove review |
| GET | `/reviews/my-reviews` | JWT User | All reviews by current user |
| GET | `/reviews/admin/pending` | JWT Admin | Reviews pending moderation |

### Payments — `/api/payments`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/payments/create-order` | JWT User | Create Razorpay order |
| POST | `/payments/verify` | JWT User | Verify payment signature (HMAC-SHA256) |
| POST | `/payments/cash` | JWT User | Record cash payment |
| GET | `/payments/history` | JWT | Paginated transaction history |
| POST | `/payments/refund` | JWT Admin | Initiate refund |
| POST | `/payments/webhook` | None | Razorpay webhook (signature verified) |

### Admin — `/api/admin`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/users` | JWT Admin | List users (search + role filter) |
| PATCH | `/admin/users/:id` | JWT Admin | Suspend / reinstate / change role |
| GET | `/admin/workers/pending` | JWT Admin | Pending KYC applications |
| PATCH | `/admin/workers/:id/verify` | JWT Admin | Approve or reject KYC |
| GET | `/admin/analytics` | JWT Admin | Platform-wide metrics |
| GET | `/admin/complaints` | JWT Admin | List complaints |
| PATCH | `/admin/complaints/:id` | JWT Admin | Resolve or escalate complaint |
| GET | `/admin/reviews` | JWT Admin | All reviews for moderation |
| DELETE | `/admin/reviews/:id` | JWT Admin | Delete review |

---

## Security Implementation

| Threat | Mitigation |
|---|---|
| XSS token theft | JWT stored in httpOnly cookie only |
| CSRF | `sameSite: strict` on JWT cookie |
| Brute force | `express-rate-limit` — 100 req/15 min globally; 10 req/15 min on login |
| NoSQL injection | `express-mongo-sanitize` strips `$` and `.` from request bodies |
| Password exposure | bcrypt cost factor 12 (~300 ms per hash) |
| Insecure headers | Helmet.js sets 11 security headers including CSP, X-Frame-Options, HSTS |
| File upload abuse | Multer MIME type allowlist (jpeg/png/webp only), 5 MB max, stored on Cloudinary only |
| Payment tampering | Razorpay HMAC-SHA256 signature verification using `crypto.timingSafeEqual()` |
| CORS bypass | CORS restricted to `FRONTEND_URL` env variable value only |
| Request forgery | CORS + sameSite cookie + JWT role validation on every state-changing route |

---

## Testing

### Test Results — 16/16 Pass (Rohith's Module)

| # | Test Case | Expected | Result |
|---|---|---|---|
| T-01 | Register with valid data | 201 + JWT cookie | PASS |
| T-02 | Register duplicate email | 400 E11000 | PASS |
| T-03 | Register 9-digit phone | 400 validation error | PASS |
| T-04 | Login correct credentials | 200 + JWT | PASS |
| T-05 | Access protected route — no JWT | 401 Unauthorized | PASS |
| T-06 | Find workers — valid search | 200 ranked array | PASS |
| T-07 | Find workers — all offline | 404 no workers | PASS |
| T-08 | Submit review after booking | 201 + rating updated | PASS |
| T-09 | Submit second review — same booking | 400 unique constraint | PASS |
| T-10 | Update profile — valid phone | 200 success | PASS |
| T-11 | Update profile — duplicate phone | 400 unique index | PASS |
| T-12 | Password reset — valid email | Token generated | PASS |
| T-13 | Add saved address (valid) | Created + isDefault | PASS |
| T-14 | Add 6th saved address | 400 max 5 allowed | PASS |
| T-15 | Set new default address | Previous default cleared | PASS |
| T-16 | Mark all notifications read | All isRead=true | PASS |

---

## Deployment Guide

### Step 1 — MongoDB Atlas
1. Create cluster at [cloud.mongodb.com](https://cloud.mongodb.com) — **M0 Free**, region: Mumbai
2. Database Access → add user with username + password
3. Network Access → **Allow Access from Anywhere** (`0.0.0.0/0`)
4. Connect → copy URI → replace `<password>` → append `/udhyogapay` before `?`

### Step 2 — Cloudinary
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Dashboard → copy **Cloud Name**, **API Key**, **API Secret**

### Step 3 — Deploy Backend on Railway
1. [railway.app](https://railway.app) → New Project → GitHub → `9059Rohith/UDHYOGAPAY`
2. New Service → Root Directory: `backend`
3. Build: `npm install && npm run build` | Start: `npm start`
4. Set all environment variables from the Backend `.env` section above (with production values)
5. Deploy → note backend URL: `https://xxx.railway.app`

### Step 4 — Deploy AI Engine on Railway
1. Same project → New Service → Root Directory: `ai_engine`
2. Build: `npm install && npm run build` | Start: `node dist/index.js`
3. Variable: `PORT=5002`
4. Deploy → note AI engine URL → set `AI_ENGINE_URL` in backend service → redeploy backend

### Step 5 — Deploy Frontend on Netlify
1. [netlify.com](https://netlify.com) → New Site → GitHub → `9059Rohith/UDHYOGAPAY`
2. Base directory: `frontend` | Build: `npm run build` | Publish: `frontend/dist`
3. Variables: `VITE_API_URL` and `VITE_SOCKET_URL` = Railway backend URL
4. Deploy → note Netlify URL

### Step 6 — Final Wiring
1. Railway backend → update `FRONTEND_URL` = your Netlify URL → redeploy

### Step 7 — Post-Deploy Verification
- [ ] `GET https://backend.railway.app/` returns JSON health response
- [ ] Frontend loads at Netlify URL — no CORS errors in browser console
- [ ] User registration succeeds — JWT cookie is set
- [ ] Worker search returns results on Leaflet map
- [ ] Admin login works at `/login` (role: Admin)
- [ ] Socket.io booking status updates arrive in real time

---

## Database Submission Files (`submission/codefile_db`)

Standalone DB package prepared for academic submission:

| File | Description |
|---|---|
| `db_config.ts` | MongoDB connection with retry logic, connection pooling options, and lifecycle event handlers |
| `schemas/user.schema.ts` | Full User schema — validations, unique indexes, 2dsphere location, bcrypt pre-save hook, password reset token method |
| `schemas/worker.schema.ts` | Worker schema — KYC fields, earnings, `2dsphere` geospatial index on `currentLocation` |
| `schemas/booking.schema.ts` | Booking schema — OTP, timeline Map, status enum, rating subdocument, geospatial location index |
| `seeds/seedUsers.ts` | Inserts 10 realistic Indian users with addresses and GPS coordinates |
| `seeds/seedWorkers.ts` | Inserts 10 workers across 5 professions with KYC-complete data |
| `seeds/seedBookings.ts` | Inserts 20 bookings across varied statuses, payment methods, and rating patterns |
| `migrations/createIndexes.ts` | Programmatic index creation across all collections |

**Run order:**
```bash
cd submission/codefile_db
# Requires ts-node and MONGODB_URI set in environment
npx ts-node seeds/seedUsers.ts
npx ts-node seeds/seedWorkers.ts
npx ts-node seeds/seedBookings.ts
npx ts-node migrations/createIndexes.ts
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Login returns 401 | JWT secret mismatch or cookie not set | Check `JWT_SECRET` is identical across deployments; verify `sameSite` cookie setting |
| Map shows no workers | Workers not online/verified or no valid location | Ensure `isOnline=true`, `isVerified=true`, and `currentLocation.coordinates` are non-zero |
| File upload fails | Cloudinary credentials wrong or MIME type rejected | Verify `CLOUDINARY_*` env vars; only JPEG/PNG/WEBP accepted, max 5 MB |
| Socket.io not connecting | CORS mismatch or wrong `VITE_SOCKET_URL` | `FRONTEND_URL` on backend must exactly match `VITE_SOCKET_URL` on frontend |
| Push rejected on `git push` | Remote has newer commits | Run `git pull --rebase origin main` then push |
| Railway deploy fails | Build error in TypeScript | Run `npx tsc -b tsconfig.json --noEmit` locally to catch type errors first |
| MongoDB connection timeout | Atlas IP not whitelisted | Network Access → confirm `0.0.0.0/0` is set |

---

## License

Academic project repository — submitted for Review 3 evaluation, Amrita School of Computing, March 2026.


## Prerequisites


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

  - MongoDB connection with retry logic and pooling options
  - Full User schema, validations, indexes, virtuals, password hashing
  - Worker schema with KYC fields, earnings, and `2dsphere` geospatial index
  - Booking schema with OTP, timeline, status enum, rating subdocument
  - Seeds 10 sample Indian users
  - Seeds 10 workers across 5 professions
  - Seeds 20 bookings with varied statuses
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


## Deployment Notes

Recommended setup:


Before deployment:

1. Confirm all env vars are set.
2. Ensure MongoDB network access is open for deployment hosts.
3. Run local build for backend/frontend/ai_engine.
4. Verify CORS origin values match deployed frontend domain.

## Troubleshooting Quick Notes


## License

Academic project repository for demonstration and evaluation.
## License

Academic project repository — submitted for Review 3 evaluation, Amrita School of Computing, March 2026.
- Backend: Railway
