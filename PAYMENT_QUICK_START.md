# 🚀 Quick Setup - Payment Module

## 📥 Get Your Razorpay Keys

1. Visit: https://razorpay.com/
2. Sign up & complete KYC
3. Go to **Settings** → **API Keys** → **Generate Test Keys**
4. Copy **Key ID** and **Key Secret**

---

## ⚙️ Update Configuration Files

### **Backend** (`backend/.env`):
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### **Frontend** (`frontend/.env`):
```env
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
```

---

## ✅ Test the Payment Flow

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Complete a booking
4. Click "Proceed to Payment"
5. Test with Razorpay test card: **4111 1111 1111 1111**

---

## 🎯 Payment Features

✅ **Online Payment** - Razorpay (UPI, Cards, Net Banking)  
✅ **Cash Payment** - Manual recording  
✅ **Transaction History** - Complete payment logs  
✅ **Refunds** - Admin refund capability  
✅ **Webhooks** - Automatic payment status updates  
✅ **Security** - Signature verification & JWT protection

---

## 📚 Full Documentation

See [PAYMENT_INTEGRATION_GUIDE.md](./PAYMENT_INTEGRATION_GUIDE.md) for complete details.

---

**Payment module is PRODUCTION-READY! 💳✨**
