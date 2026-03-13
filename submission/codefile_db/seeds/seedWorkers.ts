import { closeDB, connectDB } from '../db_config';
import User from '../schemas/user.schema';
import Worker from '../schemas/worker.schema';

const workerProfiles = [
  { name: 'S. Ramesh', email: 'ramesh.plumber@udhyogapay.in', phone: '9010011111', profession: 'plumber', experience: 8, hourlyRate: 550, skills: ['Leak repair', 'Pipeline installation'] },
  { name: 'Md. Faizan', email: 'faizan.plumber@udhyogapay.in', phone: '9010011112', profession: 'plumber', experience: 5, hourlyRate: 450, skills: ['Bathroom fitting', 'Motor repair'] },
  { name: 'Chaitanya Goud', email: 'chaitanya.elec@udhyogapay.in', phone: '9010011113', profession: 'electrician', experience: 7, hourlyRate: 600, skills: ['Wiring', 'MCB replacement'] },
  { name: 'Pradeep Kumar', email: 'pradeep.elec@udhyogapay.in', phone: '9010011114', profession: 'electrician', experience: 4, hourlyRate: 420, skills: ['Fan repair', 'Lighting setup'] },
  { name: 'Jagadeesh Rao', email: 'jagadeesh.carp@udhyogapay.in', phone: '9010011115', profession: 'carpenter', experience: 10, hourlyRate: 700, skills: ['Modular furniture', 'Door fitting'] },
  { name: 'Raj Kumar', email: 'raj.carp@udhyogapay.in', phone: '9010011116', profession: 'carpenter', experience: 6, hourlyRate: 550, skills: ['Window repair', 'Furniture assembly'] },
  { name: 'Mounika Devi', email: 'mounika.clean@udhyogapay.in', phone: '9010011117', profession: 'cleaner', experience: 5, hourlyRate: 350, skills: ['Deep cleaning', 'Sofa shampooing'] },
  { name: 'Naveen Kumar', email: 'naveen.clean@udhyogapay.in', phone: '9010011118', profession: 'cleaner', experience: 3, hourlyRate: 300, skills: ['Kitchen cleaning', 'Bathroom cleaning'] },
  { name: 'Srinivasulu', email: 'srinivas.paint@udhyogapay.in', phone: '9010011119', profession: 'painter', experience: 9, hourlyRate: 650, skills: ['Interior painting', 'Texture finish'] },
  { name: 'Arvind Reddy', email: 'arvind.paint@udhyogapay.in', phone: '9010011120', profession: 'painter', experience: 4, hourlyRate: 500, skills: ['Exterior coating', 'Wall putty'] }
] as const;

const locations: Array<[number, number]> = [
  [78.4867, 17.385],
  [78.4483, 17.4375],
  [78.3639, 17.4708],
  [78.4118, 17.4948],
  [78.4926, 17.5435],
  [78.4737, 17.4931],
  [78.4183, 17.4448],
  [78.3955, 17.4569],
  [78.561, 17.4123],
  [78.4278, 17.4065]
];

const seedWorkers = async (): Promise<void> => {
  await connectDB();

  try {
    await Worker.deleteMany({});

    const docs = [];

    for (let index = 0; index < workerProfiles.length; index += 1) {
      const profile = workerProfiles[index];
      const location = locations[index % locations.length];

      let user = await User.findOne({ email: profile.email });
      if (!user) {
        user = await User.create({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          password: 'Worker@1234',
          role: 'worker',
          isPhoneVerified: true,
          location: { type: 'Point', coordinates: location }
        });
      }

      docs.push({
        userId: user._id,
        profession: profile.profession,
        skills: profile.skills,
        experience: profile.experience,
        hourlyRate: profile.hourlyRate,
        serviceRadiusKm: 18,
        currentLocation: {
          type: 'Point',
          coordinates: location,
          lastUpdated: new Date()
        },
        isOnline: true,
        isVerified: true,
        kycStatus: 'approved',
        rating: Number((3.8 + Math.random() * 1.1).toFixed(1)),
        ratingsCount: 20 + index,
        completedBookings: 40 + index * 3,
        earnings: {
          lifetime: 120000 + index * 25000,
          thisMonth: 18000 + index * 2000,
          pendingPayout: 1500 + index * 100
        }
      });
    }

    const inserted = await Worker.insertMany(docs);
    console.log(`[seedWorkers] inserted ${inserted.length} workers`);
  } finally {
    await closeDB();
  }
};

seedWorkers().catch(async (error) => {
  console.error('[seedWorkers] failed:', error);
  await closeDB();
  process.exit(1);
});
