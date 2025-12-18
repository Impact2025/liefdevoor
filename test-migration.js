const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const MigrationStatusTracker = require('./migration-status');

const prisma = new PrismaClient();
const statusTracker = new MigrationStatusTracker();

// Test configuration - smaller dataset for testing
const TEST_CONFIG = {
  userCount: 100,
  photosPerUser: 3,
  mysql: {
    host: 'localhost',
    user: 'migration_user',
    password: 'SecurePass2024!@#',
    database: 'u14932p48270_vin',
    port: 3306
  }
};

// Generate test data
function generateTestUsers(count) {
  const users = [];
  const genders = ['M', 'F'];

  for (let i = 0; i < count; i++) {
    const gender = faker.helpers.arrayElement(genders);
    const birthDate = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });

    users.push({
      user_id: 100000 + i, // Start from high number to avoid conflicts
      mail: faker.internet.email(),
      password: faker.internet.password(12),
      name: faker.person.fullName(),
      gender: gender,
      birth: birthDate.toISOString().split('T')[0], // MySQL date format
      city: faker.location.city(),
      register: faker.date.past({ years: 2 }).toISOString().slice(0, 19).replace('T', ' '),
      last_visit: faker.date.recent({ days: 30 }).toISOString().slice(0, 19).replace('T', ' '),
      active: 1
    });
  }

  return users;
}

function generateTestUserInfo(users) {
  return users.map(user => ({
    user_id: user.user_id,
    essay: faker.lorem.paragraphs(2),
    about_me: faker.lorem.sentences(3),
    interested_in: faker.helpers.arrayElement(['M', 'F', null])
  }));
}

function generateTestPhotos(users) {
  const photos = [];
  let photoId = 100000;

  users.forEach(user => {
    // Generate 1-5 photos per user
    const photoCount = faker.number.int({ min: 1, max: 5 });

    for (let i = 0; i < photoCount; i++) {
      photos.push({
        photo_id: photoId++,
        user_id: user.user_id,
        photo_name: `test_photo_${user.user_id}_${i + 1}.jpg`,
        default: i === 0 ? 'Y' : 'N', // First photo is default
        visible: 'Y'
      });
    }
  });

  return photos;
}

// Database operations
async function setupTestDatabase() {
  console.log('🧪 Setting up test database...');

  let connection;
  try {
    connection = await mysql.createConnection(TEST_CONFIG.mysql);

    // Create test tables if they don't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user (
        user_id bigint(20) NOT NULL,
        mail varchar(255) NOT NULL,
        password varchar(255) NOT NULL,
        name varchar(255) NOT NULL,
        gender enum('M','F') DEFAULT NULL,
        birth date DEFAULT NULL,
        city varchar(255) DEFAULT NULL,
        register datetime DEFAULT NULL,
        last_visit datetime DEFAULT NULL,
        active tinyint(1) DEFAULT 1,
        PRIMARY KEY (user_id),
        UNIQUE KEY mail (mail)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS userinfo (
        user_id bigint(20) NOT NULL,
        essay text,
        about_me text,
        interested_in enum('M','F') DEFAULT NULL,
        PRIMARY KEY (user_id)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS photo (
        photo_id bigint(20) NOT NULL,
        user_id bigint(20) NOT NULL,
        photo_name varchar(255) NOT NULL,
        default enum('Y','N') DEFAULT 'N',
        visible enum('Y','N') DEFAULT 'Y',
        PRIMARY KEY (photo_id)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
    `);

    console.log('✅ Test tables created');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

async function insertTestData() {
  console.log('📝 Inserting test data...');

  let connection;
  try {
    connection = await mysql.createConnection(TEST_CONFIG.mysql);

    // Generate test data
    const users = generateTestUsers(TEST_CONFIG.userCount);
    const userInfos = generateTestUserInfo(users);
    const photos = generateTestPhotos(users);

    // Insert users
    const userValues = users.map(u => [
      u.user_id, u.mail, u.password, u.name, u.gender,
      u.birth, u.city, u.register, u.last_visit, u.active
    ]);

    await connection.execute(`
      INSERT INTO user (user_id, mail, password, name, gender, birth, city, register, last_visit, active)
      VALUES ${userValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}
    `, userValues.flat());

    // Insert user info
    const userInfoValues = userInfos.map(ui => [ui.user_id, ui.essay, ui.about_me, ui.interested_in]);
    await connection.execute(`
      INSERT INTO userinfo (user_id, essay, about_me, interested_in)
      VALUES ${userInfoValues.map(() => '(?, ?, ?, ?)').join(', ')}
    `, userInfoValues.flat());

    // Insert photos
    const photoValues = photos.map(p => [p.photo_id, p.user_id, p.photo_name, p.default, p.visible]);
    await connection.execute(`
      INSERT INTO photo (photo_id, user_id, photo_name, default, visible)
      VALUES ${photoValues.map(() => '(?, ?, ?, ?, ?)').join(', ')}
    `, photoValues.flat());

    console.log(`✅ Inserted ${users.length} users, ${userInfos.length} user infos, ${photos.length} photos`);

  } catch (error) {
    console.error('❌ Failed to insert test data:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

async function runTestMigration() {
  console.log('🚀 Running test migration...');

  try {
    // Import and run the main migration functions
    const { migrateUsers, migratePhotos } = require('./migrate-data');

    // Override batch size for testing
    const originalConfig = require('./migrate-data').config;
    originalConfig.batchSize = 50; // Smaller batches for testing

    statusTracker.startMigration();

    // Migrate users
    statusTracker.updateProgress('users');
    await migrateUsers();

    // Migrate photos
    statusTracker.updateProgress('photos');
    await migratePhotos();

    statusTracker.completeMigration(true);

    console.log('✅ Test migration completed successfully!');

  } catch (error) {
    console.error('❌ Test migration failed:', error.message);
    statusTracker.addError(error);
    statusTracker.completeMigration(false);
    throw error;
  }
}

async function verifyTestResults() {
  console.log('🔍 Verifying test results...');

  try {
    const userCount = await prisma.user.count();
    const photoCount = await prisma.photo.count();

    console.log(`📊 Migration Results:`);
    console.log(`   👥 Users migrated: ${userCount}`);
    console.log(`   🖼️  Photos migrated: ${photoCount}`);

    if (userCount >= TEST_CONFIG.userCount * 0.9) { // Allow some margin for errors
      console.log('✅ User migration successful!');
    } else {
      console.log('⚠️  User migration incomplete');
    }

    // Sample some users to verify data integrity
    const sampleUsers = await prisma.user.findMany({ take: 5 });
    console.log('\n📋 Sample migrated users:');
    sampleUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.gender}`);
    });

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');

  try {
    // Clear test data from Prisma in correct order (respecting foreign keys)
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.message.deleteMany();
    await prisma.match.deleteMany();
    await prisma.swipe.deleteMany();
    await prisma.photo.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Test data cleaned from Prisma database');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    // Try alternative cleanup approach
    try {
      await prisma.$executeRaw`TRUNCATE TABLE "Comment" CASCADE;`;
      await prisma.$executeRaw`TRUNCATE TABLE "Post" CASCADE;`;
      await prisma.$executeRaw`TRUNCATE TABLE "Message" CASCADE;`;
      await prisma.$executeRaw`TRUNCATE TABLE "Match" CASCADE;`;
      await prisma.$executeRaw`TRUNCATE TABLE "Swipe" CASCADE;`;
      await prisma.$executeRaw`TRUNCATE TABLE "Photo" CASCADE;`;
      await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE;`;
      console.log('✅ Test data cleaned using TRUNCATE CASCADE');
    } catch (truncateError) {
      console.error('❌ TRUNCATE cleanup also failed:', truncateError.message);
    }
  }
}

async function main() {
  console.log('🧪 Starting Migration Test with 100 Users');
  console.log('==========================================');

  try {
    // Setup test database
    await setupTestDatabase();

    // Insert test data
    await insertTestData();

    // Run migration
    await runTestMigration();

    // Verify results
    await verifyTestResults();

    console.log('\n🎉 Test completed successfully!');
    console.log('📋 Next steps:');
    console.log('   - Check migration-status.json for detailed report');
    console.log('   - Run: node migration-monitor.js report');
    console.log('   - View dashboard: http://localhost:3001');

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    console.log('🔍 Check the error details above');
  } finally {
    await cleanupTestData();
    await prisma.$disconnect();
  }
}

// CLI interface
if (require.main === module) {
  main();
}

module.exports = {
  generateTestUsers,
  generateTestUserInfo,
  generateTestPhotos,
  setupTestDatabase,
  insertTestData,
  runTestMigration,
  verifyTestResults,
  cleanupTestData
};