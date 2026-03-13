const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/udhyogapay')
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  role: String,
  createdAt: Date
});

const User = mongoose.model('User', UserSchema);

async function verifyAdmin() {
  try {
    console.log('\n=== Admin Account Verification ===\n');
    
    // Check for admin user
    const adminUser = await User.findOne({ 
      $or: [
        { email: 'rajuchaswik@gmail.com' },
        { phone: '9876543210' }
      ]
    });
    
    if (adminUser) {
      console.log('✓ Admin user found in database:');
      console.log('  ID:', adminUser._id);
      console.log('  Name:', adminUser.name);
      console.log('  Email:', adminUser.email);
      console.log('  Phone:', adminUser.phone);
      console.log('  Role:', adminUser.role);
      console.log('  Created:', adminUser.createdAt);
      
      if (adminUser.role !== 'admin') {
        console.log('\n⚠ WARNING: User exists but role is not "admin"!');
        console.log('  Attempting to fix...');
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('✓ Role updated to "admin"');
      }
    } else {
      console.log('✗ Admin user NOT found in database');
      console.log('  This is normal - it will be created on first login');
    }
    
    console.log('\n=== Testing Admin Login ===\n');
    
    // Test login endpoint
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rajuchaswik@gmail.com',
        password: 'Raju@2006'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✓ Admin login successful!');
      console.log('  Status:', response.status);
      console.log('  User:', data.user.name, `(${data.user.role})`);
      console.log('  Token generated: Yes');
      console.log('\n✓✓✓ Backend is working correctly! ✓✓✓');
      console.log('\nIf login fails in browser:');
      console.log('  1. Clear browser cache and cookies');
      console.log('  2. Check browser console for errors (F12)');
      console.log('  3. Verify frontend is running on http://localhost:5173');
      console.log('  4. Try incognito/private mode');
    } else {
      console.log('✗ Admin login failed!');
      console.log('  Status:', response.status);
      console.log('  Response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
}

// Run verification
verifyAdmin();
