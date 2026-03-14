// Backend comment: setWorkerOnlineWithLocation
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import '../models/User'; // Must import to register schema
import Worker from '../models/Worker';

const setWorkerOnline = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB');

    // Find all workers
    const workers = await Worker.find().populate('userId');
    console.log(`\n📊 Total Workers: ${workers.length}`);

    if (workers.length === 0) {
      console.log('❌ No workers found');
      process.exit(0);
    }

    // Set the first worker (electrician) online
    const worker = workers[0];
    const user = worker.userId as any;
    
    console.log(`\n🔧 Worker: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Profession: ${worker.profession}`);
    console.log(`   Current Status: ${worker.isOnline ? 'Online' : 'Offline'}`);
    console.log(`   Verified: ${worker.isVerified}`);
    console.log(`   Current Location: [${worker.currentLocation.coordinates}]`);

    // Set worker online with a default location (0, 0 - will be updated by client)
    // In reality, the worker should provide their actual location
    worker.isOnline = true;
    worker.availability.status = 'available';
    worker.availability.updatedAt = new Date();
    
    // Set a default location if coordinates are [0, 0]
    if (worker.currentLocation.coordinates[0] === 0 && worker.currentLocation.coordinates[1] === 0) {
      // Using a sample location (Bangalore coordinates as example)
      worker.currentLocation.coordinates = [77.5946, 12.9716]; // [longitude, latitude]
      worker.currentLocation.lastUpdated = new Date();
      console.log(`\n⚠️  Setting default location (Bangalore): [77.5946, 12.9716]`);
    }

    await worker.save();

    console.log(`\n✅ Worker set to ONLINE`);
    console.log(`   Status: ${worker.isOnline ? '🟢 Online' : '🔴 Offline'}`);
    console.log(`   Availability: ${worker.availability.status}`);
    console.log(`   Location: [${worker.currentLocation.coordinates}]`);
    
    console.log(`\n📝 Note: The worker's actual location will be updated when they:`);
    console.log(`   1. Open the worker dashboard`);
    console.log(`   2. Toggle online (if offline)`);
    console.log(`   3. Allow location permission in browser`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

setWorkerOnline();
