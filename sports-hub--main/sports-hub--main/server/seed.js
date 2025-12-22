const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Facility = require('./models/Facility');
const Court = require('./models/Court');
const Equipment = require('./models/Equipment');
const Membership = require('./models/Membership');
const Tournament = require('./models/Tournament');
const League = require('./models/League');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sports_facility_booking';

// Connect to DB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected for Seeding...'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Sample Data
const memberships = [
  {
    name: 'Basic',
    description: 'Perfect for casual players who want to enjoy our facilities occasionally.',
    price: 29.99,
    duration: 30,
    tier: 'basic',
    benefits: [
      'Access to all courts during off-peak hours',
      'Online booking system access',
      '10% discount on equipment rental',
      'Free parking',
      'Access to locker rooms'
    ],
    courtDiscount: 10,
    equipmentDiscount: 10,
    guestPasses: 1,
    isActive: true,
    isPopular: false
  },
  {
    name: 'Premium',
    description: 'Ideal for regular players who want more flexibility and savings.',
    price: 59.99,
    duration: 30,
    tier: 'premium',
    benefits: [
      'Unlimited court access (peak & off-peak)',
      'Priority booking up to 7 days in advance',
      '25% discount on equipment rental',
      'Free guest pass (2 per month)',
      'Access to premium locker rooms',
      'Free towel service',
      '10% discount on pro shop items'
    ],
    courtDiscount: 25,
    equipmentDiscount: 25,
    guestPasses: 2,
    priorityBooking: true,
    isActive: true,
    isPopular: true
  },
  {
    name: 'Elite',
    description: 'The ultimate membership for serious athletes and sports enthusiasts.',
    price: 99.99,
    duration: 30,
    tier: 'vip',
    benefits: [
      'All Premium benefits included',
      '48-hour advance booking priority',
      '50% discount on equipment rental',
      'Unlimited guest passes',
      'Free equipment rental (2 hours/day)',
      'Personal locker included',
      'Access to VIP lounge',
      'Free participation in member tournaments',
      '20% discount on coaching sessions',
      'Complimentary sports drinks'
    ],
    courtDiscount: 50,
    equipmentDiscount: 50,
    guestPasses: 10,
    priorityBooking: true,
    freeCourtHours: 2,
    isActive: true,
    isPopular: false
  }
];

const facilities = [
  {
    name: 'SportHub Main Complex',
    description: 'Our flagship facility featuring state-of-the-art courts and amenities.',
    address: {
      street: '123 Sports Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    phone: '(555) 123-4567',
    email: 'main@sporthub.com',
    amenities: ['Parking', 'Locker Rooms', 'Pro Shop', 'Cafe', 'WiFi', 'Air Conditioning'],
    operatingHours: {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '23:00' },
      saturday: { open: '07:00', close: '23:00' },
      sunday: { open: '08:00', close: '20:00' }
    },
    isActive: true
  }
];

const seedDB = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await Membership.deleteMany({});
    await Facility.deleteMany({});
    await Court.deleteMany({});
    await Equipment.deleteMany({});
    await Tournament.deleteMany({});
    await League.deleteMany({});

    // Create Memberships
    console.log('Creating memberships...');
    const createdMemberships = await Membership.insertMany(memberships);
    console.log(`✅ Created ${createdMemberships.length} memberships`);

    // Create Facility
    console.log('Creating facility...');
    const createdFacility = await Facility.create(facilities[0]);
    console.log(`✅ Created facility: ${createdFacility.name}`);

    // Create Courts
    console.log('Creating courts...');
    const courts = [
      {
        name: 'Tennis Court 1',
        facility: createdFacility._id,
        sport: 'tennis',
        courtType: 'indoor',
        surface: 'hard',
        description: 'Professional indoor tennis court with excellent lighting.',
        pricePerHour: 40,
        peakHourPrice: 55,
        capacity: 4,
        amenities: ['Lighting', 'Scoreboard', 'Seating Area', 'Ball Machine Available'],
        images: [],
        isActive: true
      },
      {
        name: 'Tennis Court 2',
        facility: createdFacility._id,
        sport: 'tennis',
        courtType: 'outdoor',
        surface: 'clay',
        description: 'Beautiful outdoor clay court for a classic tennis experience.',
        pricePerHour: 35,
        peakHourPrice: 50,
        capacity: 4,
        amenities: ['Lighting', 'Seating Area'],
        images: [],
        isActive: true
      },
      {
        name: 'Basketball Court A',
        facility: createdFacility._id,
        sport: 'basketball',
        courtType: 'indoor',
        surface: 'wood',
        description: 'Full-size indoor basketball court with NBA specifications.',
        pricePerHour: 60,
        peakHourPrice: 80,
        capacity: 12,
        amenities: ['Lighting', 'Scoreboard', 'Bleachers', 'Sound System'],
        images: [],
        isActive: true
      },
      {
        name: 'Badminton Court 1',
        facility: createdFacility._id,
        sport: 'badminton',
        courtType: 'indoor',
        surface: 'synthetic',
        description: 'Professional badminton court with proper flooring.',
        pricePerHour: 25,
        peakHourPrice: 35,
        capacity: 4,
        amenities: ['Lighting', 'Nets Provided'],
        images: [],
        isActive: true
      },
      {
        name: 'Badminton Court 2',
        facility: createdFacility._id,
        sport: 'badminton',
        courtType: 'indoor',
        surface: 'synthetic',
        description: 'Standard badminton court perfect for casual play.',
        pricePerHour: 25,
        peakHourPrice: 35,
        capacity: 4,
        amenities: ['Lighting', 'Nets Provided'],
        images: [],
        isActive: true
      },
      {
        name: 'Volleyball Court',
        facility: createdFacility._id,
        sport: 'volleyball',
        courtType: 'indoor',
        surface: 'wood',
        description: 'Indoor volleyball court suitable for competitive play.',
        pricePerHour: 50,
        peakHourPrice: 70,
        capacity: 14,
        amenities: ['Lighting', 'Nets Provided', 'Seating Area'],
        images: [],
        isActive: true
      },
      {
        name: 'Squash Court 1',
        facility: createdFacility._id,
        sport: 'squash',
        courtType: 'indoor',
        surface: 'wood',
        description: 'Glass-back squash court for professional matches.',
        pricePerHour: 30,
        peakHourPrice: 45,
        capacity: 2,
        amenities: ['Lighting', 'Glass Back Wall'],
        images: [],
        isActive: true
      },
      {
        name: 'Football Field',
        facility: createdFacility._id,
        sport: 'football',
        courtType: 'outdoor',
        surface: 'turf',
        description: 'Outdoor football field with synthetic turf.',
        pricePerHour: 80,
        peakHourPrice: 100,
        capacity: 14,
        amenities: ['Lighting', 'Goals Provided', 'Scoreboard'],
        images: [],
        isActive: true
      }
    ];
    const createdCourts = await Court.insertMany(courts);
    console.log(`✅ Created ${createdCourts.length} courts`);

    // Create Equipment
    console.log('Creating equipment...');
    const equipment = [
      {
        name: 'Tennis Racket - Pro',
        category: 'racket',
        sport: 'tennis',
        facility: createdFacility._id,
        description: 'Professional grade tennis racket, perfect for intermediate to advanced players.',
        pricePerHour: 5,
        pricePerDay: 25,
        totalQuantity: 10,
        availableQuantity: 10,
        brand: 'Wilson',
        isActive: true
      },
      {
        name: 'Tennis Racket - Beginner',
        category: 'racket',
        sport: 'tennis',
        facility: createdFacility._id,
        description: 'Lightweight racket ideal for beginners learning the game.',
        pricePerHour: 3,
        pricePerDay: 15,
        totalQuantity: 15,
        availableQuantity: 15,
        brand: 'Head',
        isActive: true
      },
      {
        name: 'Basketball',
        category: 'ball',
        sport: 'basketball',
        facility: createdFacility._id,
        description: 'Official size and weight basketball for indoor play.',
        pricePerHour: 2,
        pricePerDay: 10,
        totalQuantity: 20,
        availableQuantity: 20,
        brand: 'Spalding',
        isActive: true
      },
      {
        name: 'Badminton Racket Set',
        category: 'racket',
        sport: 'badminton',
        facility: createdFacility._id,
        description: 'Set of 2 badminton rackets with shuttlecocks included.',
        pricePerHour: 4,
        pricePerDay: 20,
        totalQuantity: 12,
        availableQuantity: 12,
        brand: 'Yonex',
        isActive: true
      },
      {
        name: 'Volleyball',
        category: 'ball',
        sport: 'volleyball',
        facility: createdFacility._id,
        description: 'Official indoor volleyball, soft touch.',
        pricePerHour: 2,
        pricePerDay: 10,
        totalQuantity: 8,
        availableQuantity: 8,
        brand: 'Mikasa',
        isActive: true
      },
      {
        name: 'Squash Racket',
        category: 'racket',
        sport: 'squash',
        facility: createdFacility._id,
        description: 'Professional squash racket with great control.',
        pricePerHour: 4,
        pricePerDay: 18,
        totalQuantity: 8,
        availableQuantity: 8,
        brand: 'Dunlop',
        isActive: true
      },
      {
        name: 'Football',
        category: 'ball',
        sport: 'football',
        facility: createdFacility._id,
        description: 'Standard football for indoor and outdoor play.',
        pricePerHour: 2,
        pricePerDay: 8,
        totalQuantity: 10,
        availableQuantity: 10,
        brand: 'Nike',
        isActive: true
      },
      {
        name: 'Tennis Ball Tube (4 balls)',
        category: 'ball',
        sport: 'tennis',
        facility: createdFacility._id,
        description: 'Pack of 4 premium tennis balls.',
        pricePerHour: 2,
        pricePerDay: 5,
        totalQuantity: 30,
        availableQuantity: 30,
        brand: 'Penn',
        isActive: true
      }
    ];
    const createdEquipment = await Equipment.insertMany(equipment);
    console.log(`✅ Created ${createdEquipment.length} equipment items`);

    // Create Tournaments
    console.log('Creating tournaments...');
    const tournaments = [
      {
        name: 'Winter Tennis Championship 2025',
        sport: 'tennis',
        description: 'Annual winter tennis championship open to all skill levels. Singles and doubles categories available.',
        facility: createdFacility._id,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-20'),
        registrationStartDate: new Date('2024-12-01'),
        registrationEndDate: new Date('2025-01-10'),
        entryFee: 50,
        prizePool: 2000,
        maxParticipants: 32,
        minParticipants: 8,
        format: 'single-elimination',
        category: 'open',
        status: 'registration-open',
        rules: [
          'Best of 3 sets for all matches',
          'Tiebreak at 6-6 in each set',
          'Players must arrive 15 minutes before match',
          'No coaching during matches'
        ],
        isPublic: true,
        isFeatured: true
      },
      {
        name: 'Basketball 3v3 Tournament',
        sport: 'basketball',
        description: 'Fast-paced 3v3 basketball tournament. Form your team and compete!',
        facility: createdFacility._id,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-02'),
        registrationStartDate: new Date('2024-12-15'),
        registrationEndDate: new Date('2025-01-28'),
        entryFee: 75,
        prizePool: 1500,
        maxParticipants: 16,
        minParticipants: 8,
        format: 'single-elimination',
        category: 'open',
        status: 'registration-open',
        teamBased: true,
        rules: [
          'Teams of 3-4 players',
          'Games to 21 points or 15 minutes',
          'Win by 2 points',
          'Call your own fouls'
        ],
        isPublic: true,
        isFeatured: true
      },
      {
        name: 'Badminton Mixed Doubles',
        sport: 'badminton',
        description: 'Mixed doubles badminton tournament. Partner up and show your skills!',
        facility: createdFacility._id,
        startDate: new Date('2025-01-25'),
        endDate: new Date('2025-01-26'),
        registrationStartDate: new Date('2024-12-01'),
        registrationEndDate: new Date('2025-01-22'),
        entryFee: 40,
        prizePool: 800,
        maxParticipants: 24,
        minParticipants: 8,
        format: 'single-elimination',
        category: 'mixed',
        status: 'registration-open',
        teamBased: true,
        rules: [
          'Each team must have 1 male and 1 female player',
          'Best of 3 games to 21 points',
          'Rally scoring system'
        ],
        isPublic: true,
        isFeatured: false
      }
    ];
    const createdTournaments = await Tournament.insertMany(tournaments);
    console.log(`✅ Created ${createdTournaments.length} tournaments`);

    // Create Leagues
    console.log('Creating leagues...');
    const leagues = [
      {
        name: 'City Basketball League',
        sport: 'basketball',
        description: 'Weekly basketball league running throughout the season. Teams compete for the championship title.',
        facility: createdFacility._id,
        season: { name: 'Winter', year: 2025 },
        startDate: new Date('2025-01-06'),
        endDate: new Date('2025-03-31'),
        registrationDeadline: new Date('2025-01-03'),
        registrationFee: 200,
        maxTeams: 12,
        format: 'league',
        teamBased: true,
        status: 'registration-open',
        rules: [
          '5v5 full court games',
          '4 quarters of 10 minutes each',
          'FIBA rules apply',
          'Teams must have minimum 7 registered players'
        ],
        isPublic: true
      },
      {
        name: 'Tennis Singles League',
        sport: 'tennis',
        description: 'Competitive tennis league for intermediate to advanced players.',
        facility: createdFacility._id,
        season: { name: 'Spring', year: 2025 },
        startDate: new Date('2025-01-13'),
        endDate: new Date('2025-04-15'),
        registrationDeadline: new Date('2025-01-10'),
        registrationFee: 100,
        maxTeams: 16,
        format: 'round-robin',
        teamBased: false,
        status: 'registration-open',
        rules: [
          'Best of 3 sets',
          'Matches scheduled weekly',
          'Players arrange match times mutually',
          'Results must be reported within 24 hours'
        ],
        isPublic: true
      }
    ];
    const createdLeagues = await League.insertMany(leagues);
    console.log(`✅ Created ${createdLeagues.length} leagues`);

    console.log('\n========================================');
    console.log('🎉 Database seeded successfully!');
    console.log('========================================');
    console.log('Created:');
    console.log(`  - ${createdMemberships.length} Memberships (Basic, Premium, Elite)`);
    console.log(`  - ${1} Facility`);
    console.log(`  - ${createdCourts.length} Courts`);
    console.log(`  - ${createdEquipment.length} Equipment items`);
    console.log(`  - ${createdTournaments.length} Tournaments`);
    console.log(`  - ${createdLeagues.length} Leagues`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
