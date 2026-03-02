# UdhyogaPay Mobile - React Native App

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 📱 Features

- **Cross-platform**: iOS and Android from single codebase
- **Modern Architecture**: Expo Router for file-based navigation
- **Type-safe**: Full TypeScript support
- **Offline-first**: Works without internet connection
- **Push Notifications**: Real-time updates
- **Biometric Auth**: Face ID, Touch ID, Fingerprint
- **Beautiful UI**: NativeWind (Tailwind CSS)
- **Smooth Animations**: Reanimated 3
- **Location Services**: Find nearby workers
- **Camera Integration**: Profile photos and documents

## 🏗️ Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication flow
│   │   ├── splash.tsx
│   │   ├── onboarding.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/            # Main app tabs
│   │   ├── home.tsx
│   │   ├── analytics.tsx
│   │   ├── notifications.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── assets/                # Images, fonts, icons
├── app.json              # Expo configuration
├── eas.json              # EAS Build configuration
└── DEPLOYMENT.md         # Deployment guide
```

## 📦 Build

```bash
# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Production build
eas build --profile production --platform all
```

## 🚀 Deploy

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📚 Documentation

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Deployment Guide](./DEPLOYMENT.md)
