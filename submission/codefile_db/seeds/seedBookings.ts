import { closeDB, connectDB } from '../db_config';
import Booking from '../schemas/booking.schema';
import User from '../schemas/user.schema';
import Worker from '../schemas/worker.schema';

const statuses = ['pending', 'accepted', 'started', 'completed', 'rejected', 'cancelled'] as const;

const otp = () => String(Math.floor(1000 + Math.random() * 9000));

const randomAddress = (index: number): { address: string; coordinates: [number, number] } => {
  const pool: Array<{ address: string; coordinates: [number, number] }> = [
    { address: 'Road No 36, Jubilee Hills, Hyderabad', coordinates: [78.4073, 17.4326] },
    { address: 'Madhapur Police Station Road, Hyderabad', coordinates: [78.3919, 17.4485] },
    { address: 'SR Nagar Main Road, Hyderabad', coordinates: [78.4438, 17.441] },
    { address: 'ECIL X Roads, Secunderabad', coordinates: [78.5658, 17.4783] },
    { address: 'LB Nagar Circle, Hyderabad', coordinates: [78.558, 17.3452] }
  ];
  return pool[index % pool.length];
};

const seedBookings = async (): Promise<void> => {
  await connectDB();

  try {
    await Booking.deleteMany({});

    const users = await User.find({ role: 'user' }).limit(10);
    const workers = await Worker.find({ isVerified: true }).limit(10);

    if (users.length === 0 || workers.length === 0) {
      throw new Error('Users/workers not found. Run seedUsers and seedWorkers first.');
    }

    const docs = [];

    for (let index = 0; index < 20; index += 1) {
      const user = users[index % users.length];
      const worker = workers[index % workers.length];
      const status = statuses[index % statuses.length];
      const location = randomAddress(index);
      const scheduledAt = new Date(Date.now() + (index + 1) * 60 * 60 * 1000);

      const timeline: any = { requestedAt: new Date(Date.now() - (index + 2) * 60 * 60 * 1000) };
      if (['accepted', 'started', 'completed'].includes(status)) {
        timeline.acceptedAt = new Date(timeline.requestedAt.getTime() + 10 * 60 * 1000);
      }
      if (['started', 'completed'].includes(status)) {
        timeline.startedAt = new Date(timeline.requestedAt.getTime() + 40 * 60 * 1000);
      }
      if (status === 'completed') {
        timeline.completedAt = new Date(timeline.requestedAt.getTime() + 120 * 60 * 1000);
      }
      if (status === 'rejected') {
        timeline.rejectedAt = new Date(timeline.requestedAt.getTime() + 8 * 60 * 1000);
      }
      if (status === 'cancelled') {
        timeline.cancelledAt = new Date(timeline.requestedAt.getTime() + 12 * 60 * 1000);
      }

      docs.push({
        userId: user._id,
        workerId: worker._id,
        serviceType: worker.profession,
        description: `Service request ${index + 1} for ${worker.profession} work at customer location.`,
        address: location.address,
        location: { type: 'Point', coordinates: location.coordinates },
        scheduledAt,
        urgency: index % 3 === 0 ? 'high' : index % 2 === 0 ? 'medium' : 'low',
        status,
        otp: otp(),
        otpVerified: ['started', 'completed'].includes(status),
        estimatedDistanceKm: Number((1.5 + (index % 6) * 0.7).toFixed(2)),
        estimatedDurationMin: 20 + index * 2,
        price: 400 + index * 60,
        paymentMethod: index % 2 === 0 ? 'cash' : 'upi',
        paymentStatus: status === 'completed' ? 'paid' : 'pending',
        timeline,
        rating:
          status === 'completed'
            ? {
                stars: (index % 5) + 1,
                comment: 'Good service and on-time completion.',
                punctuality: 4,
                quality: 4,
                behavior: 5
              }
            : undefined
      });
    }

    const inserted = await Booking.insertMany(docs);
    console.log(`[seedBookings] inserted ${inserted.length} bookings`);
  } finally {
    await closeDB();
  }
};

seedBookings().catch(async (error) => {
  console.error('[seedBookings] failed:', error);
  await closeDB();
  process.exit(1);
});
