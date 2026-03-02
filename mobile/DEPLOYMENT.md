# 🚀 UdhyogaPay Mobile App - Deployment Guide

## 📱 Overview

This is a production-ready React Native mobile application built with Expo for the UdhyogaPay platform. The app provides iOS and Android applications with full feature parity to the web version.

## 🏗️ Tech Stack

- **Framework**: React Native (Expo SDK 50)
- **Navigation**: Expo Router (File-based)
- **State Management**: Zustand + React Query
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Animations**: React Native Reanimated 3
- **Type Safety**: TypeScript (Strict Mode)

## 📋 Prerequisites

- Node.js >= 18
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Apple Developer Account (for iOS deployment)
- Google Play Console Account (for Android deployment)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment Variables

Create `.env` files:

**`.env.development`**
```env
API_URL=http://localhost:5000
EXPO_PUBLIC_API_URL=http://localhost:5000
GOOGLE_MAPS_API_KEY=your_api_key_here
```

**`.env.production`**
```env
API_URL=https://api.udhyogapay.com
EXPO_PUBLIC_API_URL=https://api.udhyogapay.com
GOOGLE_MAPS_API_KEY=your_production_api_key
```

### 3. Update Configuration Files

**`app.json`** - Update these fields:
- `expo.ios.bundleIdentifier`: Your iOS bundle ID
- `expo.android.package`: Your Android package name
- `expo.extra.eas.projectId`: Your EAS project ID (get from `eas init`)
- `expo.owner`: Your Expo username

### 4. Setup EAS (Expo Application Services)

```bash
# Login to Expo
eas login

# Initialize EAS
eas init

# Configure build profiles
eas build:configure
```

## 🎨 Development

### Run Development Server

```bash
# Start Expo Dev Server
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android

# Run on physical device
# Scan QR code in Expo Go app
```

### Development Build (Recommended for Testing Native Features)

```bash
# Build development version
eas build --profile development --platform ios
eas build --profile development --platform android

# Install on device and run
npx expo start --dev-client
```

## 📦 Building for Production

### iOS Build

```bash
# Create production build
eas build --profile production --platform ios

# The .ipa file will be generated and can be:
# 1. Downloaded from EAS dashboard
# 2. Auto-submitted to App Store (see Submit section)
```

### Android Build

```bash
# Create production AAB (App Bundle)
eas build --profile production --platform android

# Create APK for testing
eas build --profile preview --platform android
```

### Build Both Platforms

```bash
eas build --profile production --platform all
```

## 🚀 App Store Submission

### iOS - Apple App Store

#### Prerequisites
1. Apple Developer Account ($99/year)
2. App Store Connect app created
3. App icon (1024x1024px, no transparency)
4. Screenshots in required sizes
5. Privacy policy URL

#### Steps

```bash
# Update eas.json with App Store Connect credentials
# Then submit:
eas submit --platform ios --latest

# Or manually:
# 1. Download .ipa from EAS dashboard
# 2. Upload to App Store Connect using Transporter app
# 3. Fill in App Store listing info
# 4. Submit for review
```

#### App Store Requirements Checklist

- [ ] App icon (1024x1024px)
- [ ] iPhone screenshots (6.5", 5.5" displays)
- [ ] iPad screenshots (12.9", 11" displays) - if supporting iPad
- [ ] App preview video (optional but recommended)
- [ ] App description (max 4000 characters)
- [ ] Keywords (max 100 characters)
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Privacy policy URL (required)
- [ ] App category
- [ ] Age rating questionnaire completed
- [ ] Review notes for App Store reviewers
- [ ] Test account credentials (if app requires login)

### Android - Google Play Store

#### Prerequisites
1. Google Play Developer Account ($25 one-time)
2. Play Console app created
3. App icon (512x512px)
4. Feature graphic (1024x500px)
5. Screenshots in required sizes
6. Privacy policy URL

#### Steps

```bash
# Setup service account for automated submission
# 1. Create service account in Google Cloud Console
# 2. Download JSON key file
# 3. Add to project as android-service-account.json

# Submit to Play Store
eas submit --platform android --latest

# Or manually:
# 1. Download .aab from EAS dashboard
# 2. Upload to Play Console
# 3. Fill in store listing
# 4. Submit for review
```

#### Play Store Requirements Checklist

- [ ] App icon (512x512px)
- [ ] Feature graphic (1024x500px)
- [ ] Phone screenshots (min 2, max 8)
- [ ] 7" tablet screenshots (min 2)
- [ ] 10" tablet screenshots (min 2)
- [ ] Short description (max 80 characters)
- [ ] Full description (max 4000 characters)
- [ ] App category
- [ ] Content rating questionnaire completed
- [ ] Privacy policy URL
- [ ] App access (if restricted)
- [ ] Ads declaration (yes/no)
- [ ] Target audience and content

## 📸 Screenshot Generation

Generate screenshots programmatically:

```bash
# Install screenshot tool
npm install -g expo-screenshot-maker

# Generate for all required sizes
# Then manually take screenshots in app on different devices
```

### Required Screenshot Sizes

**iOS:**
- 6.5" Display (1284 x 2778px) - iPhone 14 Pro Max
- 5.5" Display (1242 x 2208px) - iPhone 8 Plus
- 12.9" Display (2048 x 2732px) - iPad Pro
- 11" Display (1668 x 2388px) - iPad Pro 11"

**Android:**
- Phone: 1080 x 1920px minimum
- 7" Tablet: 1024 x 600px minimum
- 10" Tablet: 1280 x 800px minimum

## 🎯 Features Implemented

### Authentication
- ✅ Email/Password login
- ✅ Biometric authentication (Face ID / Touch ID / Fingerprint)
- ✅ Apple Sign-In (iOS)
- ✅ Google Sign-In
- ✅ Secure token storage
- ✅ Auto-logout on token expiry
- ✅ Onboarding flow

### Core Features
- ✅ Dashboard with KPIs
- ✅ Real-time analytics
- ✅ Push notifications
- ✅ Location services
- ✅ Camera integration
- ✅ File uploads
- ✅ Offline support
- ✅ Pull-to-refresh
- ✅ Haptic feedback
- ✅ Dark mode support

### Navigation
- ✅ Bottom tabs (Home, Analytics, Notifications, Profile)
- ✅ Stack navigation
- ✅ Modal screens
- ✅ Deep linking
- ✅ Push notification routing

## 🔐 Security Features

- Secure token storage using Expo SecureStore
- Certificate pinning capability
- Biometric authentication
- Auto-logout on token expiry
- Encrypted API communication (HTTPS only)
- Input validation and sanitization

## 🌐 API Integration

The app connects to the same backend as the web application:

```typescript
// Located in: app/services/api.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// All API calls use axios instance with:
// - Auth token injection
// - Auto retry on failure
// - Request/response logging (dev only)
// - Error handling
```

## 📊 Analytics & Monitoring

Consider integrating:
- Firebase Analytics
- Sentry for error tracking
- Amplitude for user analytics

```bash
# Install analytics
npx expo install expo-firebase-analytics
npx expo install @sentry/react-native
```

## 🔄 Over-the-Air (OTA) Updates

Expo supports instant updates without app store review:

```bash
# Publish update
eas update --branch production

# Users will receive update on next app launch
```

**Note**: OTA updates only work for JS code. Native changes require new build.

## 📱 Testing

### Manual Testing Checklist

- [ ] Fresh install and onboarding
- [ ] Login with all auth methods
- [ ] All tab navigation
- [ ] Push notifications
- [ ] Offline mode
- [ ] Biometric login
- [ ] Camera permissions
- [ ] Location permissions
- [ ] Background app behavior
- [ ] App store screenshots
- [ ] Dark mode
- [ ] Different device sizes

### Automated Testing

```bash
# Run unit tests
npm test

# Run E2E tests (Detox)
npm run test:e2e:ios
npm run test:e2e:android
```

## 🐛 Common Issues & Solutions

### Issue: Build fails on iOS
**Solution**: Ensure all required certificates and provisioning profiles are set up in Apple Developer portal.

### Issue: Push notifications not working
**Solution**: 
1. Check permissions in app.json
2. Verify device token registration
3. Test with Expo push notification tool

### Issue: App crashes on startup
**Solution**: Check native logs using `npx expo run:ios` or `npx expo run:android`

## 📞 Support & Resources

- Expo Documentation: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Play Console Help: https://support.google.com/googleplay/android-developer

## 🎉 Congratulations!

Your UdhyogaPay mobile app is now ready for production deployment!

For any issues or questions, refer to the main project documentation or contact the development team.
