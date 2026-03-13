# 🚂 Railway Deployment Guide - Complete Project

## Why Railway for Full-Stack?

Railway is the **easiest platform** to deploy your complete UdhyogaPay project because:
- ✅ Deploy frontend + backend in ONE project
- ✅ Manage all environment variables in one dashboard
- ✅ Automatic HTTPS/SSL certificates
- ✅ Free tier: $5 credit/month (enough for testing)
- ✅ Zero configuration needed
- ✅ GitHub integration with auto-deploys

---

## 🚀 Complete Deployment Steps

### **Step 1: Sign Up**

1. Go to [railway.app](https://railway.app)
2. Click **Start a New Project**
3. Sign in with GitHub
4. Authorize Railway to access your repos

---

### **Step 2: Deploy Backend**

1. Click **New Project** → **Deploy from GitHub repo**
2. Select `9059Rohith/UDHYOGAPAY`
3. Railway will ask which service to deploy
4. **Configure Backend:**
   - Click **Add variables** 
   - Choose **Raw Editor** and paste:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://rajuchaswik:Raju2006@cluster0.sbpvnvc.mongodb.net/udhyogapay
JWT_SECRET=udhyogapay-super-secret-key-2026
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=dn4ei8qy8
CLOUDINARY_API_KEY=626264699119264
CLOUDINARY_API_SECRET=mjc4rsdHVYrfUFh1wkEq3yWyXXI
ADMIN_EMAIL=rajuchaswik@gmail.com
EMAIL_USER=rajuchaswik@gmail.com
EMAIL_PASSWORD=nxvsdinlrzuehzkf
FRONTEND_URL=https://placeholder.railway.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. **Configure Build Settings:**
   - Root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

6. **Generate Domain:**
   - Go to **Settings** → **Networking**
   - Click **Generate Domain**
   - You'll get: `https://udhyogapay-backend.up.railway.app`
   - **Copy this URL!**

7. Click **Deploy**

---

### **Step 3: Deploy Frontend**

1. In the same Railway project, click **New Service**
2. Select **GitHub Repo** → Same repo
3. **Configure Frontend:**
   - Click **Add variables**
   - Choose **Raw Editor** and paste:

```env
VITE_API_URL=https://udhyogapay-backend.up.railway.app
VITE_SOCKET_URL=https://udhyogapay-backend.up.railway.app
```

   *(Replace with your actual backend URL from Step 2)*

4. **Configure Build Settings:**
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Start command: `npm run preview`

5. **Generate Domain:**
   - Go to **Settings** → **Networking**
   - Click **Generate Domain**
   - You'll get: `https://udhyogapay.up.railway.app`

6. Click **Deploy**

---

### **Step 4: Update Backend with Frontend URL**

1. Go back to **Backend service**
2. Click **Variables**
3. Update `FRONTEND_URL` to your frontend URL:
   ```
   FRONTEND_URL=https://udhyogapay.up.railway.app
   ```
4. Railway will **auto-redeploy** backend

---

### **Step 5: Configure MongoDB Atlas**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to your cluster
3. Click **Network Access**
4. Click **Add IP Address**
5. Click **Allow Access from Anywhere** (Railway uses dynamic IPs)
6. Confirm

---

### **Step 6: Test Your Deployment**

1. Visit your frontend URL: `https://udhyogapay.up.railway.app`
2. Try to register/login
3. Check Railway logs if anything fails:
   - Click on service
   - Go to **Deployments** tab
   - Click **View Logs**

---

## 📊 Railway Dashboard Overview

After deployment, you'll see:

```
📦 UdhyogaPay Project
├── 🔧 backend-service
│   ├── 🌐 https://udhyogapay-backend.up.railway.app
│   ├── 📊 Metrics
│   └── 📝 Logs
└── 🎨 frontend-service
    ├── 🌐 https://udhyogapay.up.railway.app
    ├── 📊 Metrics
    └── 📝 Logs
```

---

## 💰 Pricing

**Free Tier:**
- $5 credit per month
- Enough for ~500 hours of runtime
- Perfect for testing/development

**Hobby Plan:**
- $5/month
- Better for production

---

## 🔧 Common Issues & Solutions

### **Issue: Build fails**

**Check:**
1. Root directory is set correctly (`backend` or `frontend`)
2. All environment variables are added
3. Check logs for specific error

**Fix:**
```bash
# Make sure package.json has correct scripts
"scripts": {
  "build": "tsc",           // backend
  "start": "node dist/index.js"
}
```

---

### **Issue: CORS errors**

**Fix:** Make sure `FRONTEND_URL` in backend matches your actual frontend URL exactly:
```
FRONTEND_URL=https://udhyogapay.up.railway.app
```

---

### **Issue: Environment variables not working**

**Fix:** Railway needs a redeploy after adding variables:
- Add variables
- Click **Deploy** → **Redeploy**

---

### **Issue: MongoDB connection fails**

**Fix:**
1. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
2. Verify `MONGODB_URI` is correct
3. Make sure password doesn't have special characters (or URL encode them)

---

## 🎯 Custom Domain (Optional)

Once everything works:

1. Buy a domain (Namecheap, GoDaddy, etc.)
2. In Railway → **Settings** → **Domains**
3. Add custom domain
4. Update DNS records as shown
5. Railway auto-provisions SSL

**Example:**
- Backend: `https://api.udhyogapay.com`
- Frontend: `https://udhyogapay.com`

---

## 📝 Environment Variables Reference

### **Backend Variables (Railway)**
| Variable | Example | Where to Get |
|----------|---------|--------------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas |
| `JWT_SECRET` | `your-32-char-secret` | Generate random |
| `CLOUDINARY_*` | Various | Cloudinary.com |
| `EMAIL_*` | Gmail credentials | Google Account |
| `FRONTEND_URL` | `https://your-app.railway.app` | Railway frontend |

### **Frontend Variables (Railway)**
| Variable | Example | Where to Get |
|----------|---------|--------------|
| `VITE_API_URL` | `https://backend.railway.app` | Railway backend |
| `VITE_SOCKET_URL` | `https://backend.railway.app` | Railway backend |

---

## ✅ Deployment Checklist

**Before deploying:**
- [ ] MongoDB Atlas cluster created
- [ ] MongoDB IP whitelist set to 0.0.0.0/0
- [ ] Cloudinary account set up
- [ ] Gmail app password created
- [ ] All secrets ready

**Backend deployment:**
- [ ] Service created on Railway
- [ ] All environment variables added
- [ ] Root directory set to `backend`
- [ ] Domain generated
- [ ] Deployment successful
- [ ] Logs show "Server running"

**Frontend deployment:**
- [ ] Service created on Railway
- [ ] Environment variables with backend URL added
- [ ] Root directory set to `frontend`
- [ ] Domain generated
- [ ] Deployment successful

**Post-deployment:**
- [ ] Frontend loads without errors
- [ ] Can register new user
- [ ] Can login
- [ ] MongoDB shows new data
- [ ] No CORS errors in browser console

---

## 🆘 Need Help?

**Railway Logs:**
- Click service → Deployments → View Logs
- Shows real-time build and runtime logs

**Browser Console:**
- Press F12
- Check for errors
- Verify API calls

**Railway Discord:**
- [Join Railway Discord](https://discord.gg/railway)
- Active community support

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Backend API: `https://your-backend.railway.app`
- ✅ Frontend App: `https://your-frontend.railway.app`
- ✅ All in one Railway project
- ✅ Environment variables secured
- ✅ Auto-deploy on git push
- ✅ HTTPS enabled
- ✅ Production ready!

**Share your app:** Your frontend Railway URL is publicly accessible! 🚀
