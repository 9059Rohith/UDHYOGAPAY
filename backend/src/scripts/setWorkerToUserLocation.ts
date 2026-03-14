// Backend comment: setWorkerToUserLocation
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import '../models/User';
import Worker from '../models/Worker';

const setWorkerToTestLocation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB\n');

    const workers = await Worker.find().populate('userId');
    
    if (workers.length === 0) {
      console.log('❌ No workers found');
      process.exit(0);
    }

    console.log('🔧 Setting worker to test location...\n');

    // Set to coordinates visible in user's map (Coimbatore area based on screenshot)
    // You can change these to match your user's location
    const testLocation = {
      longitude: 76.9558,  // Coimbatore, Tamil Nadu
      latitude: 11.0168
    };

    for (const worker of workers) {
      const user = worker.userId as any;
      
      console.log(`📍 Worker: ${user.name} (${worker.profession})`);
      console.log(`   Old Location: [${worker.currentLocation.coordinates}]`);
      
      worker.currentLocation.coordinates = [testLocation.longitude, testLocation.latitude];
      worker.currentLocation.lastUpdated = new Date();
      worker.isOnline = true;
      worker.availability.status = 'available';
      await worker.save();
      
      console.log(`   New Location: [${testLocation.longitude}, ${testLocation.latitude}]`);
      console.log(`   Status: 🟢 Online & Available\n`);
    }

    console.log('✅ Workers updated successfully!');
    console.log('\n💡 TIP: To set worker to YOUR location:');
    console.log('   1. Open worker dashboard in browser');
    console.log('   2. Toggle online and allow location permission');
    console.log('   3. Worker will automatically use browser location\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

setWorkerToTestLocation();
