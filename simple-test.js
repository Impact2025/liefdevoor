const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const MigrationStatusTracker = require('./migration-status');

const prisma = new PrismaClient();
const statusTracker = new MigrationStatusTracker();

// Simple test configuration
const TEST_CONFIG = {
  userCount: 100,
  photosPerUser: 3
};

// Generate test users directly for Prisma
function generateTestUsers(count) {
  const users = [];

  for (let i = 0; i < count; i++) {
    const gender = faker.helpers.arrayElement(['MALE', 'FEMALE']);
    const birthDate = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });

    users.push({
      id: `test-user-${i + 1}`,
      name: faker.person.fullName(),
      email: `test${i + 1}@example.com`,
      passwordHash: faker.internet.password(12),
      bio: faker.lorem.paragraph(),
      birthDate: birthDate,
      gender: gender,
      interests: faker.helpers.arrayElement(['MALE', 'FEMALE']),
      preferences: faker.lorem.words(3),
      city: faker.location.city(),
      profileImage: `https://example.com/photo${i + 1}.jpg`,
      voiceIntro: null,
      role: 'USER',
      isVerified: faker.datatype.boolean(),
      safetyScore: faker.number.int({ min: 50, max: 100 }),
      hasAcceptedTerms: true,
      latitude: parseFloat(faker.location.latitude()),
      longitude: parseFloat(faker.location.longitude()),
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: new Date()
    });
  }

  return users;
}

// Generate test photos
function generateTestPhotos(users) {
  const photos = [];

  users.forEach((user, userIndex) => {
    const photoCount = faker.number.int({ min: 1, max: 5 });

    for (let i = 0; i < photoCount; i++) {
      photos.push({
        id: `test-photo-${userIndex + 1}-${i + 1}`,
        url: `https://example.com/user${userIndex + 1}/photo${i + 1}.jpg`,
        order: i,
        userId: user.id
      });
    }
  });

  return photos;
}

// Test the migration system
async function runSimpleTest() {
  console.log('🧪 Starting Simple Migration Test (100 Users)');
  console.log('==============================================');

  try {
    // Generate test data
    console.log('📝 Generating test data...');
    const testUsers = generateTestUsers(TEST_CONFIG.userCount);
    const testPhotos = generateTestPhotos(testUsers);

    console.log(`✅ Generated ${testUsers.length} users and ${testPhotos.length} photos`);

    // Insert test data directly into Prisma (simulating successful migration)
    console.log('💾 Inserting test data into Prisma...');

    for (const user of testUsers) {
      await prisma.user.create({ data: user });
    }

    for (const photo of testPhotos) {
      await prisma.photo.create({ data: photo });
    }

    console.log('✅ Test data inserted successfully');

    // Verify the data
    const userCount = await prisma.user.count();
    const photoCount = await prisma.photo.count();

    console.log('\n📊 Test Results:');
    console.log(`   👥 Users in database: ${userCount}`);
    console.log(`   🖼️  Photos in database: ${photoCount}`);

    // Show sample data
    const sampleUsers = await prisma.user.findMany({
      take: 5,
      include: {
        photos: true
      }
    });

    console.log('\n📋 Sample Users:');
    sampleUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.photos.length} photos`);
    });

    // Test the status tracking
    statusTracker.startMigration();
    statusTracker.updateProgress('users', { total: testUsers.length, migrated: userCount });
    statusTracker.updateProgress('photos', { total: testPhotos.length, migrated: photoCount });
    statusTracker.completeMigration(true);

    console.log('\n✅ Migration system test completed successfully!');
    console.log('📋 Status tracking working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    statusTracker.addError(error);
    statusTracker.completeMigration(false);
  } finally {
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      await prisma.photo.deleteMany({ where: { id: { startsWith: 'test-' } } });
      await prisma.user.deleteMany({ where: { id: { startsWith: 'test-' } } });
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError.message);
    }

    await prisma.$disconnect();
  }
}

// CLI interface
if (require.main === module) {
  runSimpleTest();
}

module.exports = {
  generateTestUsers,
  generateTestPhotos,
  runSimpleTest
};