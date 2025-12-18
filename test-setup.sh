#!/bin/bash

echo "🧪 TMDS Test Setup"
echo "=================="
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check for PostgreSQL
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL found"
    PSQL_AVAILABLE=true
elif command -v docker &> /dev/null; then
    echo "✅ Docker found - will use Docker for PostgreSQL"
    DOCKER_AVAILABLE=true
else
    echo "⚠️  PostgreSQL not found locally"
    echo "📝 Options:"
    echo "   1. Install PostgreSQL: brew install postgresql@14 (macOS)"
    echo "   2. Use Docker: Install Docker Desktop"
    echo "   3. Use cloud database (Supabase, Railway, etc.)"
    echo ""
    read -p "Do you have a PostgreSQL database URL? (y/n): " has_db
    if [ "$has_db" != "y" ]; then
        echo "❌ Please set up PostgreSQL first. See DATABASE_SETUP.md"
        exit 1
    fi
fi

# Setup database with Docker if available
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo ""
    echo "🐳 Setting up PostgreSQL with Docker..."
    docker run --name tmds-postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=tmds \
        -p 5432:5432 \
        -d postgres:14 2>/dev/null || docker start tmds-postgres
    
    echo "✅ PostgreSQL container started"
    sleep 2
fi

# Check backend .env
if [ ! -f "backend/.env" ]; then
    echo ""
    echo "📝 Creating backend/.env file..."
    cat > backend/.env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tmds?schema=public"
JWT_SECRET="dev-secret-key-change-in-production-12345"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@tmds.com
REDIS_HOST=localhost
REDIS_PORT=6379
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=104857600
EOF
    echo "✅ Created backend/.env"
fi

# Check frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend/.env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > frontend/.env.local
    echo "✅ Created frontend/.env.local"
fi

echo ""
echo "📦 Running database migrations..."
cd backend
npx prisma migrate dev --name init 2>&1 | head -20

echo ""
echo "🌱 Seeding database..."
npm run prisma:seed 2>&1 | tail -10

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   Terminal 1: cd backend && npm run start:dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "📱 Then visit: http://localhost:3001"
echo "🔐 Login with: admin@tmds.com / admin123"

