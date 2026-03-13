# ========================================
# Admin Login Fix - Restart All Services
# ========================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Admin Login Fix Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Change to workspace directory
$workspaceDir = "C:\udhyogapay"
Set-Location $workspaceDir

Write-Host "1. Checking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "   ✓ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "   ✗ MongoDB is NOT running" -ForegroundColor Red
    Write-Host "   Please start MongoDB service" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Checking Backend (port 5000)..." -ForegroundColor Yellow
$backendPort = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
if ($backendPort) {
    Write-Host "   ✓ Backend is running on port 5000" -ForegroundColor Green
} else {
    Write-Host "   ✗ Backend is NOT running" -ForegroundColor Red
    Write-Host "   Starting backend..." -ForegroundColor Yellow
    Write-Host "   Please run this in a separate terminal:" -ForegroundColor Yellow
    Write-Host "   cd backend && npm start" -ForegroundColor Cyan
}

Write-Host "`n3. Checking Frontend (port 5173)..." -ForegroundColor Yellow
$frontendPort = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if ($frontendPort) {
    Write-Host "   ✓ Frontend is running on port 5173" -ForegroundColor Green
} else {
    Write-Host "   ✗ Frontend is NOT running" -ForegroundColor Red
    Write-Host "   Please run this in a separate terminal:" -ForegroundColor Yellow
    Write-Host "   cd frontend && npm run dev" -ForegroundColor Cyan
}

Write-Host "`n4. Testing Admin Login..." -ForegroundColor Yellow
if ($backendPort) {
    Set-Location "$workspaceDir\backend"
    node test-admin-login.js
    Write-Host ""
} else {
    Write-Host "   ⚠ Skipping - backend not running" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Admin Credentials:" -ForegroundColor White
Write-Host "  Email: rajuchaswik@gmail.com" -ForegroundColor Cyan
Write-Host "  Password: Raju@2006" -ForegroundColor Cyan

Write-Host "`nTo login:" -ForegroundColor White
Write-Host "  1. Open browser to: http://localhost:5173/login" -ForegroundColor Cyan
Write-Host "  2. Click the 'Admin' button (red shield icon)" -ForegroundColor Cyan
Write-Host "  3. Enter the credentials above" -ForegroundColor Cyan
Write-Host "  4. Click 'Sign In'" -ForegroundColor Cyan

Write-Host "`nIf login still fails:" -ForegroundColor White
Write-Host "  1. Clear browser cache: Ctrl + Shift + Delete" -ForegroundColor Cyan
Write-Host "  2. Try incognito mode: Ctrl + Shift + N" -ForegroundColor Cyan
Write-Host "  3. Check browser console (F12) for errors" -ForegroundColor Cyan
Write-Host "  4. See: ADMIN_LOGIN_TROUBLESHOOTING.md" -ForegroundColor Cyan

Write-Host "`n========================================`n" -ForegroundColor Cyan

Set-Location $workspaceDir
