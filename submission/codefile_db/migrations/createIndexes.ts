import { closeDB, connectDB } from '../db_config';
import Booking from '../schemas/booking.schema';
import User from '../schemas/user.schema';
import Worker from '../schemas/worker.schema';

const createIndexes = async (): Promise<void> => {
  await connectDB();

  try {
    await Promise.all([
      User.collection.createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' }),
      User.collection.createIndex({ phone: 1 }, { unique: true, name: 'users_phone_unique' }),
      User.collection.createIndex({ role: 1 }, { name: 'users_role_idx' }),
      User.collection.createIndex({ location: '2dsphere' }, { name: 'users_location_2dsphere' }),
      Worker.collection.createIndex({ userId: 1 }, { unique: true, name: 'workers_user_unique' }),
      Worker.collection.createIndex({ currentLocation: '2dsphere' }, { name: 'workers_location_2dsphere' }),
      Worker.collection.createIndex(
        { profession: 1, isOnline: 1, isVerified: 1 },
        { name: 'workers_search_compound' }
      ),
      Worker.collection.createIndex({ rating: -1, experience: -1 }, { name: 'workers_rank_idx' }),
      Booking.collection.createIndex({ userId: 1, createdAt: -1 }, { name: 'bookings_user_recent' }),
      Booking.collection.createIndex({ workerId: 1, status: 1 }, { name: 'bookings_worker_status' }),
      Booking.collection.createIndex({ scheduledAt: 1 }, { name: 'bookings_schedule_idx' }),
      Booking.collection.createIndex({ location: '2dsphere' }, { name: 'bookings_location_2dsphere' })
    ]);

    console.log('[createIndexes] all indexes created successfully');
  } finally {
    await closeDB();
  }
};

createIndexes().catch(async (error) => {
  console.error('[createIndexes] failed:', error);
  await closeDB();
  process.exit(1);
});
