import { closeDB, connectDB } from '../db_config';
import User from '../schemas/user.schema';

const users = [
  { name: 'Rohith Kumar Dhamagatla', email: 'rohith.kumar@udhyogapay.in', phone: '9700012345' },
  { name: 'Ananya Reddy', email: 'ananya.reddy@gmail.com', phone: '9849012345' },
  { name: 'Pranav Varma', email: 'pranav.varma@gmail.com', phone: '9885012345' },
  { name: 'Kavya Nair', email: 'kavya.nair@gmail.com', phone: '9000012345' },
  { name: 'Harsha Vardhan', email: 'harsha.vardhan@gmail.com', phone: '9347512345' },
  { name: 'Sneha Iyer', email: 'sneha.iyer@gmail.com', phone: '9391012345' },
  { name: 'Abhishek Sharma', email: 'abhishek.sharma@gmail.com', phone: '9502512345' },
  { name: 'Priya Menon', email: 'priya.menon@gmail.com', phone: '9515112345' },
  { name: 'Rakesh Yadav', email: 'rakesh.yadav@gmail.com', phone: '9581512345' },
  { name: 'Sravani Pola', email: 'sravani.pola@gmail.com', phone: '9676512345' }
];

const baseAddresses = [
  { line1: 'Flat 302, Sri Sai Residency, Ameerpet', city: 'Hyderabad', state: 'Telangana', pincode: '500016', coordinates: [78.4483, 17.4375] },
  { line1: 'House 11-5-431, Lakdikapul', city: 'Hyderabad', state: 'Telangana', pincode: '500004', coordinates: [78.4581, 17.3991] },
  { line1: 'Plot 19, Kondapur Main Road', city: 'Hyderabad', state: 'Telangana', pincode: '500084', coordinates: [78.3639, 17.4708] },
  { line1: 'Apartment 5A, Kukatpally Housing Board', city: 'Hyderabad', state: 'Telangana', pincode: '500072', coordinates: [78.4118, 17.4948] },
  { line1: 'Villa 26, Kompally', city: 'Hyderabad', state: 'Telangana', pincode: '500100', coordinates: [78.4926, 17.5435] }
];

const seedUsers = async (): Promise<void> => {
  await connectDB();

  try {
    await User.deleteMany({ role: 'user' });

    const docs = users.map((user, index) => {
      const address = baseAddresses[index % baseAddresses.length];
      return {
        ...user,
        password: 'User@1234',
        role: 'user' as const,
        isPhoneVerified: true,
        location: { type: 'Point' as const, coordinates: address.coordinates },
        addresses: [
          {
            label: 'Home',
            line1: address.line1,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            coordinates: address.coordinates,
            isDefault: true
          }
        ]
      };
    });

    const inserted = await User.insertMany(docs);
    console.log(`[seedUsers] inserted ${inserted.length} users`);
  } finally {
    await closeDB();
  }
};

seedUsers().catch(async (error) => {
  console.error('[seedUsers] failed:', error);
  await closeDB();
  process.exit(1);
});
