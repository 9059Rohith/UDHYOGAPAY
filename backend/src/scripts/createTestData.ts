import mongoose from 'mongoose';
import User from '../models/User';
import Worker from '../models/Worker';
import Booking from '../models/Booking';
import Review from '../models/Review';
import Payout from '../models/Payout';
import connectDatabase from '../config/database';

const createCompleteTestData = async () => {
  try {
    await connectDatabase();
    console.log('🔗 Connected to database');

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found. Run seedAdminData.ts first.');
      process.exit(1);
    }

    // Create test users
    console.log('Creating test users...');
    const userEmails = ['user1@test.com', 'user2@test.com', 'user3@test.com'];
    const users = [];
    
    for (let i = 0; i < 3; i++) {
      let user = await User.findOne({ email: userEmails[i] });
      if (!user) {
        user = await User.create({
          name: `Test User ${i + 1}`,
          email: userEmails[i],
          phone: `900000000${i}`,
          password: 'Test@123',
          role: 'user',
          location: {
            type: 'Point',
            coordinates: [77.5946 + (i * 0.01), 12.9716 + (i * 0.01)] // Bangalore coordinates
          }
        });
      }
      users.push(user);
    }
    console.log(`✅ Created/found ${users.length} test users`);

    // Create test workers
    console.log('Creating test workers...');
    const workerUsers = [];
    const workerEmails = ['worker1@test.com', 'worker2@test.com', 'worker3@test.com'];
    const professions = ['plumber', 'electrician', 'carpenter'];
    
    for (let i = 0; i < 3; i++) {
      let workerUser = await User.findOne({ email: workerEmails[i] });
      if (!workerUser) {
        workerUser = await User.create({
          name: `Test Worker ${i + 1}`,
          email: workerEmails[i],
          phone: `910000000${i}`,
          password: 'Test@123',
          role: 'worker',
          location: {
            type: 'Point',
            coordinates: [77.5946 + (i * 0.02), 12.9716 + (i * 0.02)]
          }
        });
      }
      workerUsers.push(workerUser);
    }

    const workers = [];
    for (let i = 0; i < 3; i++) {
      let worker = await Worker.findOne({ userId: workerUsers[i]._id });
      if (!worker) {
        worker = await Worker.create({
          userId: workerUsers[i]._id,
          profession: professions[i],
          experience: (i + 1) * 2,
          isVerified: true,
          kycStatus: 'approved',
          isOnline: true,
          currentLocation: {
            type: 'Point',
            coordinates: [77.5946 + (i * 0.02), 12.9716 + (i * 0.02)]
          },
          rating: 4.5,
          totalJobs: 10 + i * 5,
          documents: {
            aadhaarFront: {
              url: 'https://example.com/aadhaar.jpg',
              uploadedAt: new Date()
            },
            aadhaarBack: {
              url: 'https://example.com/aadhaar.jpg',
              uploadedAt: new Date()
            },
            policeVerification: {
              url: 'https://example.com/police.pdf',
              uploadedAt: new Date()
            }
          }
        });
      }
      workers.push(worker);
    }
    console.log(`✅ Created/found ${workers.length} test workers`);

    // Create test completed bookings
    console.log('Creating test bookings...');
    const bookings = [];
    for (let i = 0; i < 10; i++) {
      const user = users[i % users.length];
      const worker = workers[i % workers.length];
      
      const booking = await Booking.create({
        user: user._id,
        worker: worker._id,
        profession: worker.profession,
        description: `Test ${worker.profession} service - Job #${i + 1}`,
        location: {
          type: 'Point',
          coordinates: [77.5946 + (Math.random() * 0.1), 12.9716 + (Math.random() * 0.1)]
        },
        address: `Test Address ${i + 1}, Bangalore, Karnataka`,
        status: 'completed',
        otp: `${100000 + i}`,
        pricing: 150 + (i * 50),
        paymentMethod: ['cash', 'online', 'upi'][i % 3] as 'cash' | 'online' | 'upi',
        paymentStatus: 'paid',
        distance: 2 + (i * 0.5),
        estimatedTime: 30 + (i * 5),
        timeline: {
          requested: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000),
          accepted: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
          started: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000 + 40 * 60 * 1000),
          completed: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000 + 120 * 60 * 1000)
        },
        completedAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000 + 120 * 60 * 1000)
      });
      bookings.push(booking);
    }
    console.log(`✅ Created ${bookings.length} test bookings`);

    // Create test reviews
    console.log('Creating test reviews...');
    await Review.deleteMany({});
    const reviews = [];
    const goodAttributesOptions = [
      ['Professional', 'Punctual', 'Skilled'],
      ['Friendly', 'Efficient', 'Clean Work'],
      ['Expert Knowledge', 'Quality Work', 'Respectful'],
      ['Good Communication', 'Fast Service', 'Neat']
    ];
    
    const improvementOptions = [
      ['Better tools'],
      ['More experience'],
      ['Faster completion'],
      ['Cleaner workspace']
    ];

    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const rating = 4 + Math.floor(Math.random() * 2); // 4 or 5 stars
      
      const review = await Review.create({
        booking: booking._id,
        user: booking.user,
        worker: booking.worker,
        rating: rating,
        reviewTitle: `Excellent ${booking.profession} service!`,
        reviewComment: `Very satisfied with the ${booking.profession} work. The worker was professional and completed the job efficiently. Would definitely recommend!`,
        goodAttributes: goodAttributesOptions[i % goodAttributesOptions.length].join(', '),
        whatToImprove: i % 3 === 0 ? improvementOptions[i % improvementOptions.length].join(', ') : '',
        serviceQuality: rating,
        punctuality: rating,
        cleanliness: rating,
        wouldRecommend: true,
        status: i % 4 === 0 ? 'pending' : 'approved',
        createdAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000 + 180 * 60 * 1000)
      });
      reviews.push(review);
    }
    console.log(`✅ Created ${reviews.length} test reviews`);

    // Create test payouts
    console.log('Creating test payouts...');
    await Payout.deleteMany({});
    const payouts = [];
    
    for (let i = 0; i < workers.length; i++) {
      const worker = workers[i];
      const workerBookings = bookings.filter((_, idx) => idx % workers.length === i);
      const totalEarnings = workerBookings.reduce((sum, b) => sum + b.pricing, 0);
      const commissionPercent = 15;
      const commissionAmount = totalEarnings * commissionPercent / 100;
      const netPayout = totalEarnings - commissionAmount;
      const paymentMethod = ['bank_transfer', 'upi', 'cash'][i % 3] as 'bank_transfer' | 'upi' | 'cash';
      
      const payout = await Payout.create({
        worker: worker._id,
        bookings: workerBookings.map(b => b._id),
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(),
        totalEarnings,
        commissionPercent,
        commissionAmount,
        netPayout,
        paymentMethod,
        accountDetails: {
          accountHolderName: workerUsers[i].name,
          accountNumber: paymentMethod === 'bank_transfer' ? `ACC${100000000000 + i}` : undefined,
          ifscCode: paymentMethod === 'bank_transfer' ? 'HDFC0001234' : undefined,
          upiId: paymentMethod === 'upi' ? `${workerUsers[i].name.toLowerCase().replace(/\s/g, '')}@upi` : undefined
        },
        payoutStatus: i === 0 ? 'pending' : i === 1 ? 'processing' : 'completed',
        processedAt: i > 0 ? new Date(Date.now() - (2 - i) * 24 * 60 * 60 * 1000) : undefined,
        processedBy: admin._id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      });
      payouts.push(payout);
    }
    console.log(`✅ Created ${payouts.length} test payouts`);

    console.log('');
    console.log('✨ Complete test data created successfully!');
    console.log('');
    console.log('📝 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Workers: ${workers.length}`);
    console.log(`   - Bookings: ${bookings.length}`);
    console.log(`   - Reviews: ${reviews.length}`);
    console.log(`   - Payouts: ${payouts.length}`);
    console.log('');
    console.log('🎉 All admin panel forms should now work with full CRUD operations!');

  } catch (error: any) {
    console.error('❌ Error creating test data:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
};

// Run the function
createCompleteTestData();
