// Backend comment: updateWorkerLocation
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

// Import models
import '../models/User';
import Worker from '../models/Worker';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve));
};

const updateWorkerLocation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB\n');

    // Find all workers
    const workers = await Worker.find().populate('userId');
    
    if (workers.length === 0) {
      console.log('❌ No workers found');
      rl.close();
      process.exit(0);
    }

    console.log('📋 Available Workers:');
    workers.forEach((worker, index) => {
      const user = worker.userId as any;
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Profession: ${worker.profession}`);
      console.log(`   Status: ${worker.isOnline ? '🟢 Online' : '🔴 Offline'}`);
      console.log(`   Location: [${worker.currentLocation.coordinates}]`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('📍 Enter new location coordinates for the worker');
    console.log('These coordinates will be where the worker appears on the map');
    console.log('='.repeat(60) + '\n');

    const longitude = await question('Enter Longitude (e.g., 77.5946): ');
    const latitude = await question('Enter Latitude (e.g., 12.9716): ');

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lng) || isNaN(lat)) {
      console.log('\n❌ Invalid coordinates. Please enter valid numbers.');
      rl.close();
      process.exit(1);
    }

    // Update all workers to this location
    for (const worker of workers) {
      worker.currentLocation.coordinates = [lng, lat];
      worker.currentLocation.lastUpdated = new Date();
      worker.isOnline = true;
      worker.availability.status = 'available';
      await worker.save();
      
      const user = worker.userId as any;
      console.log(`\n✅ Updated ${user.name} (${worker.profession})`);
      console.log(`   Location: [${lng}, ${lat}]`);
      console.log(`   Status: 🟢 Online`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All workers updated successfully!');
    console.log('💡 Refresh your user page to see workers on the map');
    console.log('='.repeat(60) + '\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    rl.close();
    process.exit(1);
  }
};

updateWorkerLocation();
