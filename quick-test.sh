#!/bin/bash

echo "🚀 Quick Test Setup for TMDS"
echo "============================"
echo ""

cd /Users/vineeth/Downloads/downloads/vineeth/deloitte

# Check PostgreSQL installation
if ! command -v psql &> /dev/null; then
    echo "📦 PostgreSQL not found. Installing via Homebrew..."
    brew install postgresql@14
    brew services start postgresql@14
    sleep 3
    echo "✅ PostgreSQL installed and started"
else
    echo "✅ PostgreSQL found"
    # Try to start if not running
    brew services start postgresql@14 2>/dev/null || true
fi

# Create database if it doesn't exist
echo ""
echo "📊 Creating database..."
createdb tmds 2>/dev/null || echo "Database 'tmds' already exists or will be created by migrations"

# Run migrations
echo ""
echo "🔄 Running database migrations..."
cd backend
npx prisma migrate dev --name init

# Generate Prisma client
echo ""
echo "⚙️  Generating Prisma client..."
npx prisma generate

# Seed database
echo ""
echo "🌱 Seeding database with sample data..."
npm run prisma:seed

echo ""
echo "✅ Database setup complete!"
echo ""
echo "🚀 Starting servers..."
echo "   Backend will run on: http://localhost:3000"
echo "   Frontend will run on: http://localhost:3001"
echo ""
echo "📝 Open two terminals and run:"
echo "   Terminal 1: cd backend && npm run start:dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "🔐 Login credentials:"
echo "   Admin: admin@tmds.com / admin123"
echo "   Trainer: trainer@tmds.com / trainer123"
echo "   Participant: participant@tmds.com / participant123"

