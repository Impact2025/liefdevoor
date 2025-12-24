#!/bin/bash

# Production Migration Script
# Run this manually after deployment to apply database migrations

echo "🚀 Running production database migrations..."
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🔄 Applying database migrations..."
npx prisma migrate deploy

echo ""
echo "✅ Migrations completed!"
echo ""
echo "To verify, run: npx prisma migrate status"
