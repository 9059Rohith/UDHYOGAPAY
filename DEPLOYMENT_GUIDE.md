# 🚀 UdhyogaPay - Complete Deployment Guide

## 📋 Overview

This guide covers the complete deployment process for UdhyogaPay across all platforms:
- Web Application (Frontend)
- Backend API
- Mobile Apps (iOS & Android)

---

## 🌐 Web Application Deployment

### Prerequisites
- Node.js 18+
- Git
- Hosting platform account (Vercel/Netlify recommended)

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# For production
vercel --prod
```

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "https://api.udhyogapay.com"
  }
}
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Navigate to frontend
cd frontend

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Traditional Server (Nginx)

1. Build the application:
```bash
cd frontend
npm run build
```

2. Upload `dist/` folder to server

3. Configure Nginx:
```nginx
server {
    listen 80;
    server_name udhyogapay.com;
    root /var/www/udhyogapay/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ⚙️ Backend API Deployment

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or self-hosted MongoDB
- Domain name

### Option 1: Railway (Easiest)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Navigate to backend
cd backend

# Initialize
railway init

# Deploy
railway up

# Add environment variables in Railway dashboard
```

### Option 2: Render

1. Create account on render.com
2. New Web Service
3. Connect GitHub repository
4. Configure:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
5. Add environment variables

### Option 3: VPS (DigitalOcean, AWS, etc.)

1. SSH into server:
```bash
ssh root@your-server-ip
```

2. Install dependencies:
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install MongoDB (if self-hosting)
# Or use MongoDB Atlas (recommended)
```

3. Clone and setup:
```bash
git clone https://github.com/yourusername/udhyogapay.git
cd udhyogapay/backend
npm install
```

4. Create `.env` file:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/udhyogapay
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
FRONTEND_URL=https://udhyogapay.com
```

5. Start with PM2:
```bash
pm2 start src/index.ts --name udhyogapay-api --interpreter ts-node
pm2 save
pm2 startup
```

6. Setup Nginx reverse proxy:
```nginx
server {
    listen 80;
    server_name api.udhyogapay.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. Setup SSL with Let's Encrypt:
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d api.udhyogapay.com
```

### Environment Variables

Required for backend:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=https://udhyogapay.com
```

---

## 📱 Mobile App Deployment

See [mobile/DEPLOYMENT.md](./mobile/DEPLOYMENT.md) for complete mobile deployment guide.

### Quick Summary

**iOS:**
```bash
cd mobile
eas build --platform ios --profile production
eas submit --platform ios
```

**Android:**
```bash
cd mobile
eas build --platform android --profile production
eas submit --platform android
```

---

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. Create account at mongodb.com/cloud/atlas
2. Create new cluster (free tier available)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string
6. Add to environment variables

### Seed Initial Data

```bash
cd backend

# Create admin user
npm run create-admin

# Seed categories
ts-node src/scripts/seedAdminData.ts
```

---

## 🔐 Security Checklist

- [ ] All environment variables secured
- [ ] HTTPS enabled (SSL certificates)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] MongoDB Atlas IP whitelist configured
- [ ] JWT secret is strong (min 32 characters)
- [ ] Email credentials using app-specific passwords
- [ ] Cloudinary API keys secured
- [ ] .env files NOT in git repository
- [ ] Production error logging (Sentry, LogRocket)

---

## 📊 Monitoring & Maintenance

### Recommended Tools

**Error Tracking:**
- Sentry (https://sentry.io)

**Analytics:**
- Google Analytics
- Mixpanel
- Amplitude

**Uptime Monitoring:**
- UptimeRobot (free)
- Pingdom
- New Relic

**Performance:**
- Lighthouse CI
- Web Vitals
- CloudWatch (AWS)

### Setup PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install and Build
        run: |
          cd frontend
          npm install
          npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: berviantoleo/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend

  deploy-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install EAS CLI
        run: npm install -g eas-cli
      - name: Build and Submit
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
        run: |
          cd mobile
          eas build --platform all --profile production --non-interactive
```

---

## 🧪 Pre-Deployment Testing

### Web Application
```bash
cd frontend
npm run build
npm run preview
# Test thoroughly at http://localhost:4173
```

### Backend API
```bash
cd backend
npm test
npm run build
npm start
# Test all endpoints
```

### Mobile App
```bash
cd mobile
# Build preview
eas build --profile preview --platform all

# Install and test on physical devices
```

---

## 📞 Post-Deployment Checklist

- [ ] All pages load without errors
- [ ] Authentication works (login/register/logout)
- [ ] API endpoints responding correctly
- [ ] Database connections working
- [ ] File uploads working (profile pictures, documents)
- [ ] Email sending working (verification, reset password)
- [ ] Mobile apps installable and functional
- [ ] Push notifications working
- [ ] Payment integration working (if applicable)
- [ ] Map integration working
- [ ] Real-time features working (Socket.IO)
- [ ] Error tracking enabled
- [ ] Analytics tracking enabled
- [ ] SSL certificates valid
- [ ] Domain DNS configured
- [ ] Backup strategy in place

---

## 🆘 Troubleshooting

### Common Issues

**Issue: CORS errors**
```typescript
// backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

**Issue: MongoDB connection timeout**
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check network firewall

**Issue: Mobile app crashes**
- Check native dependencies installation
- Verify all required permissions in app.json
- Check error logs in Sentry

**Issue: Build fails**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all environment variables set

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Expo EAS Documentation](https://docs.expo.dev/eas/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## 🎉 Success!

Your UdhyogaPay application is now live! 🚀

**Web**: https://udhyogapay.com  
**API**: https://api.udhyogapay.com  
**iOS**: Available on App Store  
**Android**: Available on Play Store

Monitor your applications, gather user feedback, and iterate to make it even better!
