// Backend comment: testAdminLogin
import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const testAdminLogin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/udhyogapay';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const adminEmail = 'rajuchaswik@gmail.com';
    const adminPassword = 'Raju@2006';

    // Find admin user
    const admin = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('Run: npm run create-admin');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('   Name:', admin.name);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Phone:', admin.phone);
    console.log('');

    // Test password
    const isPasswordMatch = await admin.comparePassword(adminPassword);
    
    if (isPasswordMatch) {
      console.log('✅ Password is correct!');
      console.log('');
      console.log('📋 Login Credentials:');
      console.log('   Email:', adminEmail);
      console.log('   Password:', adminPassword);
      console.log('');
      console.log('✅ Admin login should work!');
    } else {
      console.log('❌ Password does not match!');
      console.log('The admin password in database is different from Raju@2006');
      console.log('');
      console.log('Fix: Run npm run create-admin to reset password');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testAdminLogin();
