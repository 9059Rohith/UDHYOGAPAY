# Quick Integration Guide - 3 New Forms

## 🚀 Quick Start

All forms are **ready to use** - just import and integrate into your existing panels!

---

## 1️⃣ Complaint Form (User & Worker Panels)

### **Import and Use:**

```tsx
import ComplaintForm from '../components/common/ComplaintForm';
import { Button } from '@mui/material';
import { useState } from 'react';

function UserDashboard() {
  const [complaintOpen, setComplaintOpen] = useState(false);
  const user = useAuth(); // Your auth context
  
  return (
    <div>
      {/* Add this button to your navbar or page */}
      <Button 
        variant="outlined" 
        onClick={() => setComplaintOpen(true)}
      >
        File a Complaint
      </Button>
      
      {/* The complaint form dialog */}
      <ComplaintForm
        open={complaintOpen}
        onClose={() => setComplaintOpen(false)}
        userId={user._id}
        jobId={optionalBookingId} // optional: pre-fill specific booking
        onSuccess={() => {
          console.log('Complaint submitted!');
          // Refresh your complaints list here
        }}
      />
    </div>
  );
}
```

### **API Endpoints Available:**

```javascript
// Submit a complaint
await api.post('/complaints/create', {
  jobId: 'booking_id',
  complaintType: 'service_quality',
  description: 'The work was not completed properly...'
});

// Get my complaints
const response = await api.get('/complaints/my-complaints');
```

---

## 2️⃣ Review Form (User Panel Only)

### **Import and Use:**

```tsx
import ReviewForm from '../components/common/ReviewForm';
import { Button, Chip } from '@mui/material';
import { useState } from 'react';

function BookingCard({ booking }) {
  const [reviewOpen, setReviewOpen] = useState(false);
  
  // Check if booking is completed and not yet reviewed
  const canReview = booking.status === 'completed' && !booking.hasReview;
  
  return (
    <div>
      <h3>{booking.profession}</h3>
      <Chip label={booking.status} />
      
      {/* Show review button only for completed bookings */}
      {canReview && (
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setReviewOpen(true)}
        >
          ⭐ Give Review
        </Button>
      )}
      
      {/* The review form dialog */}
      <ReviewForm
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        bookingId={booking._id}
        onSuccess={() => {
          console.log('Review submitted!');
          // Update booking to show review exists
          // Refresh bookings list
        }}
      />
    </div>
  );
}
```

### **API Endpoints Available:**

```javascript
// Submit a review (only after job completion)
await api.post('/reviews/create', {
  bookingId: 'booking_id',
  rating: 5,
  goodAttributes: 'Professional and punctual',
  whatToImprove: 'Could improve communication',
  reviewComment: 'Great service overall!'
});

// Get reviews for a worker
const response = await api.get(`/reviews/worker/${workerId}`);
```

---

## 3️⃣ Account Deletion & Complaints (Admin Panel)

### **Import and Use:**

```tsx
// In your AdminPanel.tsx or Admin Router

import ComplaintsManagement from './pages/Admin/ComplaintsManagement';
import AccountDeletion from './pages/Admin/AccountDeletion';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div>
      {/* Admin Navigation */}
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
        <Tab label="Dashboard" value="dashboard" />
        <Tab label="Complaints" value="complaints" />
        <Tab label="Accounts" value="accounts" />
      </Tabs>
      
      {/* Tab Content */}
      {activeTab === 'complaints' && <ComplaintsManagement />}
      {activeTab === 'accounts' && <AccountDeletion />}
    </div>
  );
}
```

### **API Endpoints Available:**

```javascript
// Get all complaints (Admin)
const response = await api.get('/complaints/admin/all', {
  params: { status: 'pending', complainantRole: 'user' }
});

// Update complaint status
await api.patch(`/complaints/admin/${complaintId}/update`, {
  status: 'resolved',
  adminNotes: 'Issue has been addressed'
});

// Get all accounts for deletion management
const response = await api.get('/account-deletion/admin/accounts', {
  params: { role: 'user', searchTerm: 'john' }
});

// Delete an account with reason logging
await api.delete(`/account-deletion/admin/delete/${userId}`, {
  data: {
    reason: 'Violation of terms of service',
    additionalInfo: 'Multiple complaints received'
  }
});

// View deletion logs
const logs = await api.get('/account-deletion/admin/logs');
```

---

## 📋 API Routes Summary

### **Complaints:**
```
POST   /api/complaints/create               (User/Worker)
GET    /api/complaints/my-complaints        (User/Worker)
GET    /api/complaints/:id                  (All)
GET    /api/complaints/admin/all            (Admin)
PATCH  /api/complaints/admin/:id/update     (Admin)
DELETE /api/complaints/admin/:id            (Admin)
```

### **Reviews:**
```
POST /api/reviews/create                    (User)
GET  /api/reviews                           (All)
GET  /api/reviews/:id                       (All)
GET  /api/reviews/worker/:workerId          (All)
```

### **Account Deletion:**
```
GET    /api/account-deletion/admin/accounts      (Admin)
GET    /api/account-deletion/admin/account/:id   (Admin)
DELETE /api/account-deletion/admin/delete/:id   (Admin)
GET    /api/account-deletion/admin/logs          (Admin)
```

---

## 🎨 Styling Notes

All forms use **Material-UI v5** components and are fully styled with:
- Responsive layouts
- Input validation
- Error/success alerts
- Loading states
- Confirmation dialogs
- DataGrid for admin views

---

## ✅ Testing Checklist

### **Test Complaint Form:**
- [ ] Open form from User panel
- [ ] Select a job from dropdown
- [ ] Select complaint type
- [ ] Write description (20+ chars)
- [ ] Click Submit → See confirmation
- [ ] Confirm → Check success message
- [ ] Verify in Admin panel

### **Test Review Form:**
- [ ] Complete a booking
- [ ] Click "Give Review" button
- [ ] Select star rating (1-5)
- [ ] Fill good attributes
- [ ] Fill what to improve
- [ ] Write comments (10+ chars)
- [ ] Click Submit → See confirmation
- [ ] Confirm → Check success
- [ ] Verify review appears in worker's profile

### **Test Account Deletion:**
- [ ] Log in as Admin
- [ ] Navigate to Account Management
- [ ] Search for a test user
- [ ] Click Delete button
- [ ] Fill reason (10+ chars)
- [ ] Click "Proceed to Delete"
- [ ] Final confirmation → Confirm
- [ ] Verify deletion log created
- [ ] Check user is removed from database

---

## 🐛 Troubleshooting

### **"Cannot find module" errors:**
```bash
cd backend && npm install
cd frontend && npm install
```

### **CORS errors:**
Check `backend/src/index.ts` - CORS should allow your frontend URL:
```typescript
app.use(cors({
  origin: 'http://localhost:5173', // or 5174
  credentials: true
}));
```

### **Authentication errors:**
Ensure you're passing the auth token in your API requests. The `protect` middleware requires JWT token.

### **MongoDB connection:**
Check `.env` file has correct `MONGODB_URI`

---

## 📱 Mobile Responsive

All forms are mobile-responsive by default using Material-UI's responsive components.

---

## 🎓 Ready for Review 2!

All 3 forms meet the requirements:
✅ 5+ controls each
✅ Easy to implement (< 1 hour each)
✅ Meaningful business value
✅ Working across panels (User, Worker, Admin)
✅ Complete CRUD operations
✅ Material-UI DataGrid
✅ OK/Cancel confirmations

**Time to take screenshots and update your LaTeX document!**
