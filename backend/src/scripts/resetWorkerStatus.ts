// Backend comment: resetWorkerStatus
import mongoose from 'mongoose';
import Worker from '../models/Worker';
import dotenv from 'dotenv';

dotenv.config();

async function resetWorkerStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Find the electrician worker
    const worker = await Worker.findOne({ profession: 'electrician' });
    
    if (!worker) {
      console.log('❌ No electrician worker found');
      process.exit(1);
    }

    console.log('📊 Current worker status:', worker.availability.status);
    
    // Reset to available
    worker.availability.status = 'available';
    worker.availability.updatedAt = new Date();
    await worker.save();
    
    console.log('✅ Worker status reset to available');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetWorkerStatus();
