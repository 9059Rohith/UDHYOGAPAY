# ⚡ UDHYOGAPAY - Quick Reference Card

## 🚀 Installation & Setup

```bash
# Web
cd frontend && npm install && npm run dev

# Mobile
cd mobile && npm install && npm start

# Backend
cd backend && npm install && npm run dev
```

## 📦 New Packages to Install

**Mobile app requires:**
```bash
cd mobile
npm install
```

All dependencies are already in package.json!

## 🎯 Key Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Command Palette | `Cmd+K` / `Ctrl+K` |
| Search | `/` |
| Close Modal | `Esc` |
| Navigate Down | `↓` |
| Navigate Up | `↑` |
| Select | `Enter` |

## 📁 Where to Find Things

```
Design System      → frontend/src/components/design-system/
Custom Hooks       → frontend/src/hooks/
Analytics          → frontend/src/pages/Admin/ExecutiveDashboard.tsx
Mobile App         → mobile/
Shared Code        → shared/
Documentation      → *.md files in root
```

## 🎨 Component Import Examples

```tsx
// Design System
import { Button, Card, Badge, KPICard, Modal } from '@/components/design-system';

// Hooks
import { usePagination, useTableSort, useDebounce } from '@/hooks';

// Shared Code
import { User, Booking } from '@shared/types';
import { formatCurrency, formatDate } from '@shared/utils';
```

## 🏃 Quick Commands

```bash
# Run web app
npm run dev                    # http://localhost:5173

# Build web for production
npm run build                  # Creates dist/ folder

# Run mobile app
npm start                      # Expo Dev Server
npm run ios                    # iOS Simulator
npm run android                # Android Emulator

# Build mobile for production
eas build --platform all       # iOS + Android

# Deploy
vercel                         # Web to Vercel
eas submit --platform all      # Mobile to stores
```

## 🎯 Important URLs

| Service | URL |
|---------|-----|
| Web Dev | http://localhost:5173 |
| API Dev | http://localhost:5000 |
| Expo DevTools | Press `d` in terminal |
| Design System | /components/design-system/ |

## 📱 Mobile Deep Links

```
udhyogapay://                  # App home
udhyogapay://booking/:id       # Specific booking
udhyogapay://worker/:id        # Worker profile
```

## 🔑 Environment Variables

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
```

**Mobile (.env)**
```env
EXPO_PUBLIC_API_URL=http://localhost:5000
GOOGLE_MAPS_API_KEY=your_key
```

**Backend (.env)**
```env
MONGODB_URI=your_connection_string
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud
```

## 🎨 Design System Components

| Component | Use Case |
|-----------|----------|
| Button | Primary actions, forms |
| Card | Content containers |
| Badge | Status indicators |
| Input | Form fields |
| Modal | Dialogs, forms |
| KPICard | Dashboard metrics |
| CommandPalette | Global search |
| Skeleton | Loading states |
| EmptyState | No content screens |

## 📊 New Features Added

✅ Executive Dashboard with KPIs  
✅ Command Palette (Cmd+K)  
✅ Advanced design system  
✅ Custom hooks library  
✅ React Native mobile app  
✅ Shared code architecture  
✅ Production deployment configs  
✅ Comprehensive documentation  

## 🚨 Common Commands

```bash
# Clear cache
npm run dev -- --force         # Web
npx expo start -c              # Mobile

# Type checking
npm run type-check             # Check TypeScript

# Linting
npm run lint                   # Run ESLint

# Build and preview
npm run build && npm run preview
```

## 📚 Documentation Files

- `FINAL_SUMMARY.md` - Complete overview
- `MASTER_IMPLEMENTATION.md` - All changes detailed
- `DEPLOYMENT_GUIDE.md` - How to deploy everywhere
- `mobile/DEPLOYMENT.md` - Mobile-specific deployment
- `mobile/README.md` - Mobile quick start
- `shared/README.md` - Shared code guide

## 🎯 Next Steps

1. ✅ Review FINAL_SUMMARY.md
2. ✅ Test all new components
3. ✅ Run mobile app
4. ✅ Read deployment guides
5. ✅ Start implementing features

## 💡 Pro Tips

- Use `Cmd+K` for quick navigation
- All components are in Storybook-ready format
- Mobile app works with Expo Go
- Shared folder keeps web/mobile in sync
- Design system is fully customizable

## 🎨 Color Palette

```css
Primary Green:   #22c55e
Secondary Yellow: #facc15
Success:         #10b981
Warning:         #f59e0b
Error:           #ef4444
Info:            #3b82f6
```

## 🔥 Hot Features

1. **Command Palette** - Press Cmd+K anywhere
2. **KPI Dashboard** - Real-time metrics with trends
3. **Mobile Apps** - Production-ready iOS & Android
4. **Biometric Auth** - Face ID/Touch ID support
5. **Push Notifications** - Fully configured
6. **Offline Support** - Works without internet

## 📞 Getting Help

1. Read `FINAL_SUMMARY.md` first
2. Check specific feature docs
3. Review code examples
4. Examine existing implementations
5. Test in isolation

## ⚡ Performance Tips

- Use React.memo for heavy components
- Implement virtual scrolling for long lists
- Lazy load routes with React.lazy
- Optimize images (WebP format)
- Enable compression on server
- Use CDN for static assets

## 🎉 You're All Set!

Everything you need is documented and ready to use.

**Happy Coding! 🚀**
