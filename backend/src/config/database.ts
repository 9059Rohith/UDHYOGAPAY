// Backend comment: database
import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/udhyogapay';
    
    await mongoose.connect(mongoUri);
    
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    
    // Create geospatial indexes
    await createIndexes();
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    if (!db) {
      console.log('⚠️ Database connection not ready, skipping index creation');
      return;
    }
    
    // Worker geospatial index
    await db.collection('workers').createIndex({ currentLocation: '2dsphere' });
    await db.collection('workers').createIndex({ isOnline: 1, isVerified: 1 });
    await db.collection('workers').createIndex({ profession: 1 });
    
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ phone: 1 }, { unique: true });
    
    // Booking indexes
    await db.collection('bookings').createIndex({ status: 1, createdAt: -1 });
    
    console.log('✅ Database indexes created successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('ℹ️ Indexes may already exist:', errorMessage);
  }
};

export default connectDatabase;
