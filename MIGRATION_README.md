# 🚀 Enterprise Data Migration System - MySQL to Prisma

**Professional-grade migration system** for the "Liefde Voor Iedereen" dating app with enterprise monitoring, CI/CD integration, and comprehensive error handling.

## 🏆 **System Features**

### ✅ **Enterprise Capabilities**
- **Real-time Monitoring Dashboard** - Live migration tracking with web interface
- **Advanced Health Monitoring** - System and database health checks with alerting
- **CI/CD Pipeline Integration** - GitHub Actions workflow with automated deployment
- **Professional Error Handling** - Comprehensive error tracking and recovery
- **Performance Profiling** - Real-time performance metrics and optimization
- **Automated Backup & Rollback** - Enterprise-grade disaster recovery
- **Multi-environment Support** - Development, staging, and production configurations

## Overview

The migration script transfers data from these MySQL tables to the new Prisma schema:
- `user` table → `User` model
- `userinfo` table → `User` model (extended profile data)
- `photo` table → `Photo` model

## Prerequisites

1. **Database Access**: Ensure you have access to the old MySQL database
2. **Node.js Dependencies**: Install required packages:
   ```bash
   npm install mysql2
   ```
3. **Environment Setup**: Create a `.env` file with your database credentials
4. **Backup**: Always backup your target database before running migrations

## Database Schema Mapping

### User Data Mapping

| Old MySQL (`user` table) | New Prisma (`User` model) | Transformation |
|--------------------------|---------------------------|---------------|
| `user_id` | `id` | Convert to string |
| `name` | `name` | Direct copy |
| `mail` | `email` | Direct copy |
| `password` | `passwordHash` | Direct copy (assumes already hashed) |
| `gender` ('M'/'F') | `gender` ('MALE'/'FEMALE'/'NON_BINARY') | Map enum values |
| `birth` | `birthDate` | Convert to Date object |
| `city` | `city` | Direct copy |
| `register` | `createdAt` | Convert to Date object |
| `last_visit` | `updatedAt` | Convert to Date object |
| `role` | `role` ('USER'/'ADMIN') | Map enum values |
| `active` | `isVerified` | Convert boolean |

### Extended Profile Data Mapping

| Old MySQL (`userinfo` table) | New Prisma (`User` model) | Notes |
|-------------------------------|---------------------------|-------|
| `essay` | `bio` | Primary bio source |
| `about_me` | `bio` | Fallback bio source |
| `interested_in` | `interestedIn` | Array of genders |

### Photo Data Mapping

| Old MySQL (`photo` table) | New Prisma (`Photo` model) | Notes |
|---------------------------|----------------------------|-------|
| `photo_name` | `url` | Prepend with `/uploads/photos/` |
| `default` ('Y'/'N') | `order` | 0 for default, 1+ for others |
| `user_id` | `userId` | Convert to string |

## Configuration

### 🚀 **Quick Start (Professional Setup)**

1. **Copy the environment template:**
   ```bash
   cp .env.mysql.example .env.mysql
   ```

2. **Edit your MySQL credentials:**
   ```bash
   # Windows
   notepad .env.mysql

   # Linux/Mac
   nano .env.mysql
   ```

3. **Fill in your actual database credentials:**
   ```bash
   MYSQL_HOST=your_mysql_host
   MYSQL_USER=your_mysql_username
   MYSQL_PASSWORD=your_secure_password
   MYSQL_DATABASE=u14932p48270_vin
   ```

4. **Run the professional migration:**
   ```bash
   # Windows
   run-migration.bat

   # Linux/Mac
   ./run-migration.sh
   ```

### 🔧 **Manual Configuration (Advanced)**

If you prefer manual setup:

1. **Update Photo Path** if your photos are stored differently:
   ```javascript
   url: oldPhoto.photo_name ? `/your/photo/path/${oldPhoto.photo_name}` : '',
   ```

2. **Adjust Batch Size** for performance:
   ```bash
   MIGRATION_BATCH_SIZE=500  # Smaller for slower connections
   MIGRATION_BATCH_SIZE=2000 # Larger for fast connections
   ```

## Running the Migration

### Step 1: Prepare Environment
```bash
# Ensure your .env file has the correct DATABASE_URL for PostgreSQL
# Backup your PostgreSQL database
cp prisma/dev.db prisma/dev.db.backup
```

### Step 2: Test Migration (Small Batch)
The script includes LIMIT clauses for testing. Run with a small batch first:
```bash
node migrate-data.js
```

### Step 3: Full Migration
Remove or increase the LIMIT clauses in the SQL queries for full migration:
```javascript
// Change this:
LIMIT 1000  // For users
LIMIT 5000  // For photos

// To this:
LIMIT 100000  // Or remove entirely for full migration
```

## Migration Process

1. **User Migration**: Migrates basic user information, authentication data, and profile details
2. **Photo Migration**: Migrates user photos and sets profile images
3. **Data Validation**: Checks for existing users to avoid duplicates

## Error Handling

The migration script includes:
- Duplicate detection (skips users with existing emails)
- Error logging for individual records
- Transaction-safe operations
- Graceful handling of missing or invalid data

## Post-Migration Tasks

1. **Verify Data Integrity**:
   ```bash
   npx prisma studio
   # Check user counts, photo associations, etc.
   ```

2. **Update Photo URLs**: If photo paths need adjustment, run:
   ```sql
   UPDATE "Photo" SET url = REPLACE(url, 'old/path', 'new/path');
   ```

3. **Password Hashing**: If passwords aren't already properly hashed, you may need to re-hash them.

4. **Test Application**: Ensure login, profile viewing, and photo display work correctly.

## Troubleshooting

### Common Issues

1. **MySQL Connection Errors**:
   - Verify MySQL server is running
   - Check credentials and permissions
   - Ensure MySQL port is accessible

2. **Prisma Connection Errors**:
   - Verify DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Check database permissions

3. **Data Type Errors**:
   - Check for invalid dates ('0000-00-00')
   - Verify enum mappings
   - Handle NULL values appropriately

4. **Memory Issues**:
   - For large datasets, increase Node.js memory limit:
     ```bash
     node --max-old-space-size=4096 migrate-data.js
     ```

### Rollback Procedure

If migration fails or data corruption occurs:

1. **Restore Database**:
   ```bash
   cp prisma/dev.db.backup prisma/dev.db
   ```

2. **Clear Migrated Data** (if partial migration occurred):
   ```sql
   DELETE FROM "Photo";
   DELETE FROM "User";
   ```

## Performance Considerations

- **Batch Processing**: The script processes users in batches to avoid memory issues
- **Indexing**: Ensure proper indexes on email fields for duplicate checking
- **Connection Pooling**: Consider using connection pooling for large migrations

## Security Notes

- **Passwords**: Assumes passwords are already properly hashed. If not, implement re-hashing.
- **Sensitive Data**: Ensure no sensitive data is logged during migration.
- **Access Control**: Restrict access to migration scripts in production.

## Support

For issues with the migration:
1. Check the console output for specific error messages
2. Verify data types and constraints in both databases
3. Test with a small dataset first
4. Ensure all prerequisites are met

## Migration Checklist

- [ ] MySQL credentials configured
- [ ] PostgreSQL database backed up
- [ ] Photo paths verified
- [ ] Test migration completed successfully
- [ ] Full migration executed
- [ ] Data integrity verified
- [ ] Application tested with migrated data
- [ ] Old database archived (optional)