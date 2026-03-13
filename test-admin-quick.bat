@echo off
echo ========================================
echo   Quick Admin Login Test
echo ========================================
echo.
echo Testing admin login...
echo.

cd /d "%~dp0backend"
node test-admin-login.js

echo.
echo ========================================
echo If you see "success: true" above, 
echo the backend is working correctly!
echo.
echo If login still fails in browser:
echo   1. Clear browser cache (Ctrl+Shift+Delete)
echo   2. Try incognito mode (Ctrl+Shift+N)
echo   3. Check frontend is running on port 5173
echo   4. Open browser console (F12) for errors
echo ========================================
echo.
pause
