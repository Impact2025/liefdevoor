#!/bin/bash

# Professional Migration Runner for Linux/Mac
# Usage: ./run-migration.sh

set -e  # Exit on any error

echo "🚀 Starting Professional Data Migration"
echo "====================================="

# Check if .env.mysql exists
if [ ! -f ".env.mysql" ]; then
    echo "❌ Error: .env.mysql file not found!"
    echo "📝 Please create .env.mysql from .env.mysql.example"
    echo "   cp .env.mysql.example .env.mysql"
    echo "   nano .env.mysql  # or your preferred editor"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Backup current database
echo "💾 Creating database backup..."
if [ -f "prisma/dev.db" ]; then
    BACKUP_FILE="prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)"
    cp "prisma/dev.db" "$BACKUP_FILE"
    echo "✅ Database backup created: $BACKUP_FILE"
else
    echo "⚠️  No existing database to backup"
fi

# Run the migration
echo "🔄 Running migration..."
node migrate-data.js

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Migration completed successfully!"
    echo "📋 Next steps:"
    echo "   1. Run: npx prisma studio"
    echo "   2. Verify data in the application"
    echo "   3. Test user login and profiles"
else
    echo ""
    echo "💥 Migration failed!"
    echo "🔍 Check the error messages above"
    echo "🛠️  Troubleshooting:"
    echo "   - Verify MySQL credentials in .env.mysql"
    echo "   - Ensure MySQL server is running"
    echo "   - Check PostgreSQL DATABASE_URL"
    exit 1
fi