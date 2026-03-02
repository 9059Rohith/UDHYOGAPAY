import mongoose from 'mongoose';
import Review from '../models/Review';
import Payout from '../models/Payout';
import ServiceCategory from '../models/ServiceCategory';
import User from '../models/User';
import Worker from '../models/Worker';
import Booking from '../models/Booking';
import connectDatabase from '../config/database';

// Define proper types for populated documents
interface PopulatedWorker {
  _id: mongoose.Types.ObjectId;
  userId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
  };
  profession: string;
}

const seedAdminData = async () => {
  try {
    await connectDatabase();
    console.log('🔗 Connected to database');

    // Find or create admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('⚠️  No admin found, creating one...');
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@udhyogapay.com',
        phone: '9999999999',
        password: 'Admin@123',
        role: 'admin'
      });
      console.log('✅ Admin user created');
    }

    // Check if we have users, workers, and bookings first
    const users = await User.find({ role: 'user' }).limit(5);
    const workers = (await Worker.find().limit(5).populate('userId')) as unknown as PopulatedWorker[];
    const bookings = await Booking.find({ status: 'completed' }).limit(10);

    console.log(`📊 Found ${users.length} users, ${workers.length} workers, ${bookings.length} completed bookings`);

    // Clear existing data
    await ServiceCategory.deleteMany({});
    console.log('🗑️  Cleared service categories');

    // Seed Service Categories
    const serviceCategories = [
      {
        serviceName: 'Plumbing Services',
        serviceCode: 'PLB001',
        description: 'Professional plumbing services including pipe fitting, leak repairs, and installations',
        basePrice: 100,
        pricePerKm: 50,
        minimumCharge: 150,
        estimatedDuration: 120,
        serviceIcon: '🔧',
        category: 'regular',
        surgePricingMultiplier: 1.0,
        isActive: true,
        requiredSkills: ['Pipe Fitting', 'Leak Repair', 'Drainage'],
        createdBy: admin._id
      },
      {
        serviceName: 'Electrical Work',
        serviceCode: 'ELC001',
        description: 'Complete electrical services including wiring, repairs, and appliance installation',
        basePrice: 150,
        pricePerKm: 60,
        minimumCharge: 200,
        estimatedDuration: 90,
        serviceIcon: '⚡',
        category: 'urgent',
        surgePricingMultiplier: 1.5,
        isActive: true,
        requiredSkills: ['Wiring', 'Circuit Repairs', 'Appliance Installation'],
        createdBy: admin._id
      },
      {
        serviceName: 'Carpentry Services',
        serviceCode: 'CRP001',
        description: 'Expert carpentry work including furniture repair, woodwork, and custom fitting',
        basePrice: 120,
        pricePerKm: 55,
        minimumCharge: 180,
        estimatedDuration: 150,
        serviceIcon: '🪚',
        category: 'regular',
        surgePricingMultiplier: 1.0,
        isActive: true,
        requiredSkills: ['Furniture Making', 'Wood Repair', 'Installation'],
        createdBy: admin._id
      },
      {
        serviceName: 'House Painting',
        serviceCode: 'PNT001',
        description: 'Professional painting services for interior and exterior walls',
        basePrice: 200,
        pricePerKm: 70,
        minimumCharge: 300,
        estimatedDuration: 240,
        serviceIcon: '🎨',
        category: 'regular',
        surgePricingMultiplier: 1.0,
        isActive: true,
        requiredSkills: ['Wall Painting', 'Surface Preparation', 'Color Mixing'],
        createdBy: admin._id
      },
      {
        serviceName: 'Deep Cleaning',
        serviceCode: 'CLN001',
        description: 'Thorough cleaning services for homes and offices',
        basePrice: 80,
        pricePerKm: 40,
        minimumCharge: 120,
        estimatedDuration: 180,
        serviceIcon: '🧹',
        category: 'regular',
        surgePricingMultiplier: 1.0,
        isActive: true,
        requiredSkills: ['House Cleaning', 'Deep Cleaning', 'Sanitization'],
        createdBy: admin._id
      },
      {
        serviceName: 'AC Repair & Service',
        serviceCode: 'ACR001',
        description: 'Air conditioner repair, servicing, and maintenance',
        basePrice: 180,
        pricePerKm: 65,
        minimumCharge: 250,
        estimatedDuration: 120,
        serviceIcon: '❄️',
        category: 'urgent',
        surgePricingMultiplier: 1.8,
        isActive: true,
        requiredSkills: ['AC Repair', 'Gas Filling', 'Maintenance'],
        createdBy: admin._id
      },
      {
        serviceName: 'Premium Home Renovation',
        serviceCode: 'RNV001',
        description: 'Complete home renovation and remodeling services',
        basePrice: 500,
        pricePerKm: 100,
        minimumCharge: 800,
        estimatedDuration: 480,
        serviceIcon: '🏠',
        category: 'premium',
        surgePricingMultiplier: 2.0,
        isActive: true,
        requiredSkills: ['Renovation', 'Design', 'Project Management'],
        createdBy: admin._id
      },
      {
        serviceName: 'Emergency Plumbing',
        serviceCode: 'EPLB001',
        description: '24/7 emergency plumbing services for urgent issues',
        basePrice: 200,
        pricePerKm: 80,
        minimumCharge: 300,
        estimatedDuration: 90,
        serviceIcon: '🚨',
        category: 'urgent',
        surgePricingMultiplier: 2.5,
        isActive: true,
        requiredSkills: ['Emergency Response', 'Leak Repair', 'Pipe Fitting'],
        createdBy: admin._id
      }
    ];

    const createdCategories = await ServiceCategory.insertMany(serviceCategories);
    console.log(`✅ Created ${createdCategories.length} service categories`);

    // Seed Reviews (only if we have bookings)
    if (bookings.length > 0 && workers.length > 0) {
      // Clear reviews to avoid duplicates
      await Review.deleteMany({});
      console.log('🗑️  Cleared reviews');

      const reviewData = [];
      const reviewTitles = [
        'Excellent Service!',
        'Very Professional',
        'Highly Recommended',
        'Great Experience',
        'Outstanding Work',
        'Satisfied Customer',
        'Good Service',
        'Average Experience'
      ];

      const goodAttributesList = [
        ['Professional', 'Punctual', 'Skilled'],
        ['Friendly', 'Efficient', 'Clean'],
        ['Expert', 'Thorough', 'Reliable'],
        ['Courteous', 'Fast', 'Quality Work'],
        ['Knowledgeable', 'Neat', 'Respectful']
      ];

      const improvementSuggestions = [
        ['Better communication'],
        ['More tools'],
        ['Faster service'],
        ['Lower prices'],
        ['Follow-up calls']
      ];

      for (let i = 0; i < Math.min(bookings.length, 15); i++) {
        const booking = bookings[i];
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
        
        reviewData.push({
          booking: booking._id,
          user: booking.user,
          worker: booking.worker,
          rating: rating,
          reviewTitle: reviewTitles[Math.floor(Math.random() * reviewTitles.length)],
          reviewComment: `The worker did an excellent job. Very satisfied with the ${booking.profession} service provided. Would definitely hire again for future work.`,
          goodAttributes: goodAttributesList[Math.floor(Math.random() * goodAttributesList.length)],
          whatToImprove: improvementSuggestions[Math.floor(Math.random() * improvementSuggestions.length)],
          serviceQuality: rating,
          punctuality: Math.floor(Math.random() * 2) + 4,
          cleanliness: Math.floor(Math.random() * 2) + 4,
          wouldRecommend: rating >= 4,
          status: i % 5 === 0 ? 'pending' : 'approved',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
        });
      }

      if (reviewData.length > 0) {
        const createdReviews = await Review.insertMany(reviewData);
        console.log(`✅ Created ${createdReviews.length} reviews`);
      }
    } else {
      console.log('⚠️  Skipping reviews - no completed bookings found');
    }

    // Seed Payouts (only if we have workers and bookings)
    if (workers.length > 0 && bookings.length > 0) {
      // Clear payouts to avoid duplicates
      await Payout.deleteMany({});
      console.log('🗑️  Cleared payouts');

      const payoutData = [];
      const paymentMethods: ('bank_transfer' | 'upi' | 'cash')[] = ['bank_transfer', 'upi', 'cash'];
      const statuses: ('pending' | 'processing' | 'completed' | 'failed')[] = ['pending', 'processing', 'completed', 'completed'];

      for (let i = 0; i < Math.min(workers.length, 12); i++) {
        const worker = workers[i % workers.length];
        const numBookings = Math.floor(Math.random() * 3) + 1;
        const workerBookingIds = bookings.slice(i * 2, i * 2 + numBookings).map(b => b._id);
        const totalEarnings = (Math.random() * 2000 + 500).toFixed(2);
        const commissionPercent = 15;
        const commissionAmount = (parseFloat(totalEarnings) * commissionPercent / 100).toFixed(2);
        const netPayout = (parseFloat(totalEarnings) - parseFloat(commissionAmount)).toFixed(2);
        const paymentMethod = paymentMethods[i % paymentMethods.length];
        const status = statuses[i % statuses.length];

        payoutData.push({
          worker: worker._id,
          bookings: workerBookingIds,
          totalEarnings: parseFloat(totalEarnings),
          commissionPercent: commissionPercent,
          commissionAmount: parseFloat(commissionAmount),
          netPayout: parseFloat(netPayout),
          paymentMethod: paymentMethod,
          accountDetails: {
            accountHolderName: worker.userId.name,
            accountNumber: paymentMethod === 'bank_transfer' ? `ACC${Math.floor(Math.random() * 1000000000000)}` : undefined,
            ifscCode: paymentMethod === 'bank_transfer' ? 'HDFC0001234' : undefined,
            upiId: paymentMethod === 'upi' ? `${worker.userId.name.toLowerCase().replace(/\s/g, '')}@upi` : undefined
          },
          payoutStatus: status,
          processedAt: status === 'completed' ? new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000) : undefined,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
      }

      if (payoutData.length > 0) {
        const createdPayouts = await Payout.insertMany(payoutData);
        console.log(`✅ Created ${createdPayouts.length} payouts`);
      }
    } else {
      console.log('⚠️  Skipping payouts - no workers or bookings found');
    }

    console.log('');
    console.log('✨ Mock data seeding completed successfully!');
    console.log('');
    console.log('📝 Summary:');
    console.log(`   - Service Categories: ${createdCategories.length}`);
    console.log(`   - Reviews: ${bookings.length > 0 ? Math.min(bookings.length, 15) : 0}`);
    console.log(`   - Payouts: ${workers.length > 0 ? Math.min(workers.length, 12) : 0}`);
    console.log('');
    console.log('🎉 You can now test the admin panel forms!');

  } catch (error: any) {
    console.error('❌ Error seeding data:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedAdminData();
