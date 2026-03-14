// Backend comment: checkWorkers
import mongoose from 'mongoose';
import Worker from '../models/Worker';
import User from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const checkWorkers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/udhyogapay';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all workers without populate first
    const allWorkers = await Worker.find();
    console.log(`📊 Total Workers in Database: ${allWorkers.length}\n`);

    // Get online workers
    const onlineWorkers = await Worker.find({ isOnline: true });
    console.log(`🟢 Online Workers: ${onlineWorkers.length}`);
    for (const w of onlineWorkers) {
      console.log(`  - Profession: ${w.profession}`);
      console.log(`    Online: ${w.isOnline}, Verified: ${w.isVerified}, KYC: ${w.kycStatus}`);
      console.log(`    Location: [${w.currentLocation.coordinates}]`);
      console.log(`    Availability: ${w.availability.status}\n`);
    }

    // Get verified workers
    const verifiedWorkers = await Worker.find({ isVerified: true });
    console.log(`\n✅ Verified Workers: ${verifiedWorkers.length}`);

    // Get online AND verified workers
    const onlineVerifiedWorkers = await Worker.find({ 
      isOnline: true, 
      isVerified: true,
      'currentLocation.coordinates.0': { $ne: 0 },
      'currentLocation.coordinates.1': { $ne: 0 }
    });
    console.log(`\n🎯 Online & Verified Workers with Valid Location: ${onlineVerifiedWorkers.length}`);
    for (const w of onlineVerifiedWorkers) {
      console.log(`  - Profession: ${w.profession}`);
      console.log(`    Location: [${w.currentLocation.coordinates}]`);
    }

    // Check electricians specifically
    const electricians = await Worker.find({ 
      profession: 'electrician',
      isOnline: true,
      isVerified: true
    });
    console.log(`\n⚡ Online Verified Electricians: ${electricians.length}`);
    for (const w of electricians) {
      console.log(`  - Profession: ${w.profession}`);
      console.log(`    Location: [${w.currentLocation.coordinates}]`);
      console.log(`    Last Updated: ${w.currentLocation.lastUpdated}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkWorkers();
