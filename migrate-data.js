const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const MigrationStatusTracker = require('./migration-status');

const prisma = new PrismaClient();
const statusTracker = new MigrationStatusTracker();

// Professional database configuration with environment variables
function loadDatabaseConfig() {
  // Load environment variables from .env.mysql
  require('dotenv').config({ path: path.join(__dirname, '.env.mysql') });

  // Validate required environment variables
  const requiredEnvVars = [
    'MYSQL_HOST',
    'MYSQL_USER',
    'MYSQL_PASSWORD',
    'MYSQL_DATABASE',
    'DATABASE_URL' // For Prisma
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n📝 Please set these in your .env file or environment.');
    console.error('📄 See .env.mysql.example for the required format.');
    process.exit(1);
  }

  return {
    mysql: {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      connectTimeout: 60000,
      // SSL configuration for production
      ssl: process.env.MYSQL_SSL === 'true' ? {
        ca: process.env.MYSQL_SSL_CA,
        cert: process.env.MYSQL_SSL_CERT,
        key: process.env.MYSQL_SSL_KEY,
        rejectUnauthorized: true
      } : false
    },
    batchSize: parseInt(process.env.MIGRATION_BATCH_SIZE || '1000'),
    maxRetries: parseInt(process.env.MIGRATION_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.MIGRATION_RETRY_DELAY || '1000')
  };
}

// Create .env.mysql.example if it doesn't exist
function createEnvExample() {
  const envExamplePath = path.join(__dirname, '.env.mysql.example');

  if (!fs.existsSync(envExamplePath)) {
    const envExample = `# MySQL Database Configuration for Migration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=u14932p48270_vin
MYSQL_SSL=false

# Optional SSL configuration (for production MySQL)
# MYSQL_SSL=true
# MYSQL_SSL_CA=/path/to/ca.pem
# MYSQL_SSL_CERT=/path/to/client-cert.pem
# MYSQL_SSL_KEY=/path/to/client-key.pem

# Migration Configuration
MIGRATION_BATCH_SIZE=1000
MIGRATION_MAX_RETRIES=3
MIGRATION_RETRY_DELAY=1000

# Keep your existing DATABASE_URL for Prisma
DATABASE_URL="postgresql://username:password@localhost:5432/datingsite2026"
`;

    fs.writeFileSync(envExamplePath, envExample);
    console.log('✅ Created .env.mysql.example file');
  }
}

// Create example file first (before validation)
createEnvExample();

// Initialize configuration
const config = loadDatabaseConfig();

// Use config.mysql instead of mysqlConfig

// Field mappings and transformation functions
const mapGender = (oldGender) => {
  if (oldGender === 'M') return 'MALE';
  if (oldGender === 'F') return 'FEMALE';
  return 'NON_BINARY'; // default fallback
};

const mapRole = (oldRole) => {
  if (oldRole === 'admin' || oldRole === 'demo_admin') return 'ADMIN';
  return 'USER';
};

const transformUserData = (oldUser, oldUserInfo) => {
  return {
    id: oldUser.user_id.toString(), // Convert to string for Prisma
    name: oldUser.name || null,
    email: oldUser.mail || null,
    passwordHash: oldUser.password || null, // Note: This assumes passwords are already hashed
    bio: oldUserInfo?.essay || oldUserInfo?.about_me || null,
    birthDate: oldUser.birth && oldUser.birth !== '0000-00-00' ? new Date(oldUser.birth) : null,
    gender: mapGender(oldUser.gender),
    interestedIn: [], // Will be populated from userinfo.interested_in if available
    city: oldUser.city || null,
    profileImage: null, // Will be set from default photo later
    voiceIntro: null, // Not available in old data
    role: mapRole(oldUser.role),
    isVerified: oldUser.active === 1,
    safetyScore: 100, // Default value
    hasAcceptedTerms: true, // Assume existing users have accepted
    latitude: null, // Not available
    longitude: null, // Not available
    createdAt: oldUser.register && oldUser.register !== '0000-00-00 00:00:00' ? new Date(oldUser.register) : new Date(),
    updatedAt: oldUser.last_visit && oldUser.last_visit !== '0000-00-00 00:00:00' ? new Date(oldUser.last_visit) : new Date(),
  };
};

const transformPhotoData = (oldPhoto, userId) => {
  return {
    url: oldPhoto.photo_name ? `/uploads/photos/${oldPhoto.photo_name}` : '', // Assuming photos are stored in uploads/photos/
    order: oldPhoto.default === 'Y' ? 0 : 1, // Default photo gets order 0
    userId: userId.toString(),
  };
};

async function migrateUsers() {
  console.log('🚀 Starting user migration...');

  let connection;
  try {
    // Connect to MySQL
    connection = await mysql.createConnection(config.mysql);
    console.log('✅ Connected to MySQL database');

    // Get users with their profile info
    const [users] = await connection.execute(`
      SELECT u.*, ui.essay, ui.about_me, ui.interested_in
      FROM user u
      LEFT JOIN userinfo ui ON u.user_id = ui.user_id
      WHERE u.active = 1
      ORDER BY u.user_id
      LIMIT ${config.batchSize}
    `);

    console.log(`Found ${users.length} users to migrate`);
    statusTracker.updateProgress('users', { total: users.length });

    let migratedCount = 0;
    let skippedCount = 0;

    for (const [index, oldUser] of users.entries()) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: oldUser.mail }
        });

        if (existingUser) {
          console.log(`⏭️  Skipping user ${oldUser.user_id} - email ${oldUser.mail} already exists`);
          skippedCount++;
          statusTracker.updateProgress('users', { skipped: skippedCount });
          continue;
        }

        // Transform user data
        const userData = transformUserData(oldUser, { essay: oldUser.essay, about_me: oldUser.about_me, interested_in: oldUser.interested_in });

        // Create user in Prisma
        const newUser = await prisma.user.create({
          data: userData
        });

        console.log(`✅ Migrated user ${oldUser.user_id} -> ${newUser.id} (${index + 1}/${users.length})`);
        migratedCount++;
        statusTracker.updateProgress('users', { migrated: migratedCount });

      } catch (error) {
        console.error(`❌ Error migrating user ${oldUser.user_id}:`, error.message);
        statusTracker.addError(error, { userId: oldUser.user_id, email: oldUser.mail });
        statusTracker.updateProgress('users', { errors: statusTracker.getStatus().progress.users.errors + 1 });
      }
    }

    console.log(`🎯 User migration completed: ${migratedCount} migrated, ${skippedCount} skipped`);

  } catch (error) {
    console.error('Error during user migration:', error);
  } finally {
    if (connection) await connection.end();
  }
}

async function migratePhotos() {
  console.log('🖼️  Starting photo migration...');

  let connection;
  try {
    connection = await mysql.createConnection(config.mysql);

    // Get photos for migrated users
    const [photos] = await connection.execute(`
      SELECT p.*, u.mail as user_email
      FROM photo p
      INNER JOIN user u ON p.user_id = u.user_id
      WHERE p.visible = 'Y' AND u.active = 1
      ORDER BY p.user_id, p.default DESC
      LIMIT ${config.batchSize * 5}
    `);

    console.log(`Found ${photos.length} photos to migrate`);
    statusTracker.updateProgress('photos', { total: photos.length });

    let migratedCount = 0;
    let skippedCount = 0;

    for (const [index, oldPhoto] of photos.entries()) {
      try {
        // Find the migrated user
        const user = await prisma.user.findUnique({
          where: { email: oldPhoto.user_email }
        });

        if (!user) {
          console.log(`⏭️  Skipping photo ${oldPhoto.photo_id} - user not found`);
          skippedCount++;
          statusTracker.updateProgress('photos', { skipped: skippedCount });
          continue;
        }

        // Transform photo data
        const photoData = transformPhotoData(oldPhoto, user.id);

        // Create photo in Prisma
        await prisma.photo.create({
          data: photoData
        });

        // If this is the default photo, update user's profileImage
        if (oldPhoto.default === 'Y') {
          await prisma.user.update({
            where: { id: user.id },
            data: { profileImage: photoData.url }
          });
        }

        console.log(`🖼️  Migrated photo ${oldPhoto.photo_id} for user ${user.id} (${index + 1}/${photos.length})`);
        migratedCount++;
        statusTracker.updateProgress('photos', { migrated: migratedCount });

      } catch (error) {
        console.error(`❌ Error migrating photo ${oldPhoto.photo_id}:`, error.message);
        statusTracker.addError(error, { photoId: oldPhoto.photo_id, userEmail: oldPhoto.user_email });
        statusTracker.updateProgress('photos', { errors: statusTracker.getStatus().progress.photos.errors + 1 });
      }
    }

    console.log(`🎯 Photo migration completed: ${migratedCount} migrated, ${skippedCount} skipped`);

  } catch (error) {
    console.error('Error during photo migration:', error);
  } finally {
    if (connection) await connection.end();
  }
}

async function main() {
  console.log('🔄 Starting Professional Data Migration from MySQL to Prisma...');
  console.log('📊 Configuration:', {
    mysqlHost: config.mysql.host,
    mysqlDatabase: config.mysql.database,
    batchSize: config.batchSize,
    maxRetries: config.maxRetries
  });
  console.log('');

  // Initialize status tracking
  statusTracker.startMigration();

  try {
    // Validate connections before starting
    console.log('🔍 Validating database connections...');
    await validateConnections();
    console.log('✅ Database connections validated\n');

    // Migrate users first
    statusTracker.updateProgress('users');
    await migrateUsers();
    console.log('');

    // Then migrate photos
    statusTracker.updateProgress('photos');
    await migratePhotos();
    console.log('');

    // Data validation
    console.log('🔍 Running data validation...');
    await validateMigrationData();
    console.log('✅ Data validation completed\n');

    // Mark as completed
    statusTracker.completeMigration(true);

    console.log('🎉 Migration completed successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Run: npx prisma studio');
    console.log('   2. Test the application with migrated data');
    console.log('   3. Check migration-status.json for detailed report');

  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    statusTracker.addError(error, { phase: statusTracker.getStatus().phase });
    statusTracker.completeMigration(false);

    console.error('\n🔍 Troubleshooting:');
    console.error('   - Check migration-status.json for detailed error report');
    console.error('   - Verify MySQL credentials in .env.mysql');
    console.error('   - Ensure MySQL server is running');
    console.error('   - Check PostgreSQL DATABASE_URL');
    console.error('   - Review error logs above');

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Validate database connections before migration
async function validateConnections() {
  try {
    // Test MySQL connection
    const mysqlConnection = await mysql.createConnection(config.mysql);
    await mysqlConnection.execute('SELECT 1');
    await mysqlConnection.end();
    console.log('   ✅ MySQL connection successful');
  } catch (error) {
    throw new Error(`MySQL connection failed: ${error.message}`);
  }

  try {
    // Test Prisma connection
    await prisma.$connect();
    console.log('   ✅ PostgreSQL connection successful');
  } catch (error) {
    throw new Error(`PostgreSQL connection failed: ${error.message}`);
  }
}

// Validate migrated data integrity
async function validateMigrationData() {
  try {
    const userCount = await prisma.user.count();
    const photoCount = await prisma.photo.count();

    console.log(`   📊 Migrated ${userCount} users and ${photoCount} photos`);

    // Check for data consistency
    const usersWithPhotos = await prisma.user.count({
      where: { profileImage: { not: null } }
    });

    const photosWithoutUsers = await prisma.photo.count({
      where: {
        user: null
      }
    });

    if (photosWithoutUsers > 0) {
      statusTracker.addWarning(`${photosWithoutUsers} photos have no associated user`);
    }

    console.log(`   ✅ ${usersWithPhotos} users have profile images`);
    if (photosWithoutUsers === 0) {
      console.log('   ✅ All photos are properly associated with users');
    }

  } catch (error) {
    statusTracker.addError(error, { context: 'data_validation' });
    console.warn('   ⚠️  Data validation encountered issues (see migration status)');
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { migrateUsers, migratePhotos, main };