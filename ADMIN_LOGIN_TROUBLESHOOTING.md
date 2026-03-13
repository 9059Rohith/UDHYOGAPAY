# Admin Login Troubleshooting Guide

## ✓ Backend Status: WORKING
- Admin account exists and is configured correctly
- Admin email: rajuchaswik@gmail.com
- Admin password: Raju@2006
- Backend is running on port 5000
- MongoDB is connected

## Quick Fix Steps

### 1. Clear Browser Cache
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files" and "Cookies"
3. Clear data
4. Close and reopen browser

### 2. Try Incognito Mode  
1. Press `Ctrl + Shift + N` (Chrome) or `Ctrl + Shift + P` (Firefox)
2. Navigate to http://localhost:5173/login
3. Click "Admin" button
4. Enter credentials:
   - Email: rajuchaswik@gmail.com
   - Password: Raju@2006

### 3. Check Frontend is Running
```powershell
# Check if frontend is running on port 5173
Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
```

If not running:
```powershell
cd C:\udhyogapay\frontend
npm run dev
```

### 4. Restart Both Servers
```powershell
# From workspace root
cd C:\udhyogapay

# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### 5. Check for Browser Console Errors
1. Open browser to http://localhost:5173/login
2. Press F12 to open Developer Tools
3. Click "Console" tab
4. Look for any error messages (red text)
5. If you see CORS errors, ensure backend is running

### 6. Verify Network Requests
1. Open Developer Tools (F12)
2. Click "Network" tab
3. Try to login
4. Look for a POST request to `/api/auth/login`
5. Click on it and check:
   - Status should be 200
   - Response should contain `"success": true`

## Common Issues

### Issue: "Cannot connect to server"
**Solution**: Make sure backend is running:
```powershell
cd C:\udhyogapay\backend
npm start
```

### Issue: "Invalid credentials"
**Solution**: Make sure you're using the correct credentials:
- Email: rajuchaswik@gmail.com
- Password: Raju@2006
- Click the "Admin" toggle button (red shield icon)

### Issue: "Redirected to wrong page"
**Solution**: Clear localStorage:
1. Open Developer Tools (F12)
2. Go to "Application" tab
3. Click "Local Storage" > "http://localhost:5173"
4. Right-click and select "Clear"
5. Refresh page (F5)

### Issue: TypeScript errors in VS Code
**Solution**: Reload VS Code window:
1. Press `Ctrl + Shift + P`
2. Type "Reload Window"
3. Press Enter

## Test Admin Login from Command Line

```powershell
cd C:\udhyogapay\backend
node test-admin-login.js
```

Should return:
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "...",
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "rajuchaswik@gmail.com",
    "role": "admin"
  }
}
```

## Still Having Issues?

1. **Check .env files exist**:
   - `C:\udhyogapay\backend\.env`
   - `C:\udhyogapay\frontend\.env`

2. **Restart VS Code completely**

3. **Check Windows Firewall isn't blocking ports 5000 or 5173**

4. **Try a different browser**

5. **Check if backend .env has correct settings**:
   ```
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=your-super-secret-key-change-in-production
   ```

## Need More Help?

Run the verification script:
```powershell
cd C:\udhyogapay\backend
node verify-admin.js
```

This will check:
- MongoDB connection
- Admin user exists
- Backend login endpoint works
