# 💰 SETUP WALLET & INSTALL SCRIPT
# Run this in PowerShell to set up and install everything

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   🚀 UDHYOGAPAY MOBILE - WORLD CLASS SETUP    " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to mobile folder
Write-Host "📁 Navigating to mobile folder..." -ForegroundColor Yellow
Set-Location -Path "mobile"

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "⚠️  node_modules already exists. Cleaning..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules" -Recurse -Force
    Write-Host "✅ Cleaned node_modules" -ForegroundColor Green
}

# Check if package-lock.json exists
if (Test-Path "package-lock.json") {
    Write-Host "🧹 Removing package-lock.json..." -ForegroundColor Yellow
    Remove-Item -Path "package-lock.json" -Force
    Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Installing dependencies (this may take 2-3 minutes)..." -ForegroundColor Yellow
Write-Host "   Using --legacy-peer-deps to resolve conflicts" -ForegroundColor Gray
Write-Host ""

# Install dependencies
npm install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ✅ ✅ INSTALLATION SUCCESSFUL! ✅ ✅ ✅" -ForegroundColor Green
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "          📱 YOUR APP IS READY!                 " -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎉 Everything installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 WHAT YOU GOT:" -ForegroundColor Yellow
    Write-Host "   ✅ 25+ world-class screens" -ForegroundColor White
    Write-Host "   ✅ 300+ beautiful icons" -ForegroundColor White
    Write-Host "   ✅ Biometric authentication" -ForegroundColor White
    Write-Host "   ✅ Wallet system" -ForegroundColor White
    Write-Host "   ✅ Real-time messaging UI" -ForegroundColor White
    Write-Host "   ✅ Advanced search & filters" -ForegroundColor White
    Write-Host "   ✅ Notifications center" -ForegroundColor White
    Write-Host "   ✅ All animations & haptics" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   1️⃣  Start development server:" -ForegroundColor Cyan
    Write-Host "      npm start" -ForegroundColor White
    Write-Host ""
    Write-Host "   2️⃣  Run on device:" -ForegroundColor Cyan
    Write-Host "      npm run ios       (Mac only)" -ForegroundColor White
    Write-Host "      npm run android   (Any OS)" -ForegroundColor White
    Write-Host ""
    Write-Host "   3️⃣  Or scan QR with Expo Go app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📚 DOCUMENTATION:" -ForegroundColor Yellow
    Write-Host "   - QUICK_START.md  - Get started in 5 minutes" -ForegroundColor White
    Write-Host "   - MOBILE_APP_FEATURES.md - Complete feature list" -ForegroundColor White
    Write-Host "   - DEPLOYMENT.md - Deploy to App Store/Play Store" -ForegroundColor White
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "   💎 WORLD-CLASS APP - READY TO LAUNCH! 💎    " -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 TROUBLESHOOTING:" -ForegroundColor Yellow
    Write-Host "   1. Make sure Node.js (v18+) is installed" -ForegroundColor White
    Write-Host "   2. Try clearing npm cache:" -ForegroundColor White
    Write-Host "      npm cache clean --force" -ForegroundColor Gray
    Write-Host "   3. Try again with:" -ForegroundColor White
    Write-Host "      npm install --legacy-peer-deps --force" -ForegroundColor Gray
    Write-Host ""
}

# Return to root
Set-Location -Path ".."
