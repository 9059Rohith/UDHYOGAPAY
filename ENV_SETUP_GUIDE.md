# 🔐 Environment Variables Setup Guide

## Understanding Environment Variables

Environment variables are **configuration settings** that should **NEVER** be committed to GitHub. Instead, you configure them in your deployment platform's dashboard.

---

## 📋 For Each Deployment Platform

### **Netlify** (Frontend Deployment)

1. Go to your site in Netlify Dashboard
2. Navigate to: **Site settings** → **Environment variables**
3. Click **Add a variable** and add these:

```
VITE_API_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

**Note:** For Netlify, you're deploying the **frontend**, so you only need frontend variables (VITE_*).

---

### **Vercel** (Frontend Alternative)

1. Go to your project in Vercel Dashboard
2. Navigate to: **Settings** → **Environment Variables**
3. Add the same variables as Netlify above

---

### **Railway/Render** (Backend Deployment)

1. Go to your backend service in Railway/Render Dashboard
2. Navigate to: **Variables** or **Environment** tab
3. Add these variables with **YOUR ACTUAL VALUES**:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=use-a-strong-random-32-character-secret-here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ADMIN_EMAIL=your-admin-email@gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
FRONTEND_URL=https://your-frontend-url.netlify.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🎯 Where to Get These Values

### **MONGODB_URI**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you haven't)
3. Click **Connect** → **Connect your application**
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<dbname>` with your values

**Example:**
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/udhyogapay
```

---

### **JWT_SECRET**
Generate a strong random secret (minimum 32 characters):

**Option 1 - PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Option 2 - Online:**
Visit: https://generate-secret.vercel.app/32

**Example:**
```
JWT_SECRET=a8f5c9d2e7b4f1a3c6e9b2d5f8a1c4e7
```

---

### **Cloudinary Credentials**
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to **Dashboard**
3. Copy:
   - Cloud Name
   - API Key
   - API Secret

**Example:**
```
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz12345
```

---

### **Gmail App Password** (for EMAIL_PASSWORD)
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security**
3. Enable **2-Step Verification** (required)
4. Go to **App passwords**
5. Generate a password for "Mail"
6. Copy the 16-character password

**Example:**
```
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  (remove spaces when using)
```

---

### **FRONTEND_URL**
This is the URL where your **frontend is deployed**.

**Examples:**
- Netlify: `https://udhyogapay.netlify.app`
- Vercel: `https://udhyogapay.vercel.app`
- Custom domain: `https://www.udhyogapay.com`

---

## 🚀 Deployment Workflow

### **Step 1: Deploy Backend First**

1. Choose platform: Railway, Render, or Heroku
2. Connect your GitHub repository
3. Select the `backend` folder
4. **Add ALL backend environment variables** in the platform's dashboard
5. Deploy

**You'll get a URL like:** `https://udhyogapay-backend.railway.app`

---

### **Step 2: Deploy Frontend**

1. Choose platform: Netlify or Vercel
2. Connect your GitHub repository
3. Set build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
4. **Add frontend environment variables:**
   ```
   VITE_API_URL=https://udhyogapay-backend.railway.app
   VITE_SOCKET_URL=https://udhyogapay-backend.railway.app
   ```
5. Deploy

---

## 🔒 Security Best Practices

### ✅ **DO:**
- Keep `.env` files LOCAL only (never commit to GitHub)
- Use `.env.example` files with placeholder values in your repo
- Configure real values in deployment platform dashboards
- Rotate secrets immediately if they're ever exposed
- Use strong, random secrets (32+ characters)
- Enable 2FA on all service accounts

### ❌ **DON'T:**
- Commit `.env` files to GitHub
- Share secrets in chat/email
- Use weak or predictable secrets
- Hardcode secrets in source code
- Reuse the same secret across projects

---

## 🆘 Common Issues

### **Issue: "Environment variable not found"**
**Solution:** Make sure you saved the variables in your deployment platform and redeployed.

### **Issue: "Connection refused" or CORS errors**
**Solution:** Check that `FRONTEND_URL` in backend matches your actual frontend URL exactly (including https://).

### **Issue: "Invalid credentials"**
**Solution:** Verify MongoDB URI, Cloudinary keys, and email password are correct. Remove any extra spaces.

### **Issue: Netlify secrets scanning failure**
**Solution:** This means real secrets were found in your code/repo. They should ONLY be in the platform's environment variables dashboard, not in code.

---

## 📝 Quick Reference Checklist

**Before deploying, make sure you have:**

- [ ] MongoDB Atlas connection string
- [ ] Strong JWT secret (32+ chars)
- [ ] Cloudinary account credentials
- [ ] Gmail app password configured
- [ ] Backend deployed and URL noted
- [ ] Frontend environment variables point to backend URL
- [ ] All `.env` files added to `.gitignore`
- [ ] No secrets committed to GitHub

---

## 💡 Example: Complete Setup

**Your local `.env` (NOT in GitHub):**
```env
MONGODB_URI=mongodb+srv://john:pass123@cluster.mongodb.net/udhyogapay
JWT_SECRET=x9k2m5n8p1q4r7s0t3v6w9y2a5b8c1d4
CLOUDINARY_CLOUD_NAME=mycloud
...
```

**Railway Backend Dashboard Variables:**
Same values as your local `.env` but with `NODE_ENV=production`

**Netlify Frontend Dashboard Variables:**
```
VITE_API_URL=https://udhyogapay-api.railway.app
VITE_SOCKET_URL=https://udhyogapay-api.railway.app
```

---

**Remember:** Your `.env` file stays on your computer. The deployment platform's dashboard is where you configure the production values! 🎯
