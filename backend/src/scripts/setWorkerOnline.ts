// Backend comment: setWorkerOnline
import mongoose from 'mongoose';
import Worker from '../models/Worker';
import User from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const setWorkerOnline = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/udhyogapay';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get the worker (assuming there's only one for now)
    const workers = await Worker.find();
    
    if (workers.length === 0) {
      console.log('❌ No workers found in database');
      await mongoose.disconnect();
      process.exit(1);
    }

    const worker = workers[0];
    console.log(`📋 Worker: ${worker.profession}`);
    console.log(`   Verified: ${worker.isVerified}`);
    console.log(`   Online: ${worker.isOnline}`);
    console.log(`   Location: [${worker.currentLocation.coordinates}]\n`);

    // Set worker online with test location (you can change these coordinates)
    // Default: Somewhere in India (example coordinates)
    const testLatitude = 28.6139;  // Delhi latitude
    const testLongitude = 77.2090; // Delhi longitude

    worker.isOnline = true;
    worker.isVerified = true;
    worker.kycStatus = 'approved';
    worker.availability.status = 'available';
    worker.availability.updatedAt = new Date();
    worker.currentLocation.coordinates = [testLongitude, testLatitude];
    worker.currentLocation.lastUpdated = new Date();

    await worker.save();

    console.log('✅ Worker set to ONLINE');
    console.log(`📍 Location: [${worker.currentLocation.coordinates}]`);
    console.log(`   Latitude: ${testLatitude}`);
    console.log(`   Longitude: ${testLongitude}`);
    console.log('\n🎯 Worker is now visible to users!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setWorkerOnline();
