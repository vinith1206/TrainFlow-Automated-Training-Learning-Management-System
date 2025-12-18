#!/bin/bash

echo "🚀 TMDS Setup Script"
echo "==================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL 14+ or use Docker."
    echo "   You can skip this if using a remote database."
else
    echo "✅ PostgreSQL detected"
fi

echo ""
echo "📦 Installing Backend Dependencies..."
cd backend
npm install

echo ""
echo "📦 Installing Frontend Dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📝 Next Steps:"
echo "1. Create backend/.env file (see backend/.env.example)"
echo "2. Update DATABASE_URL with your PostgreSQL connection string"
echo "3. Run: cd backend && npx prisma migrate dev"
echo "4. Run: cd backend && npm run prisma:seed"
echo "5. Start backend: cd backend && npm run start:dev"
echo "6. Start frontend: cd frontend && npm run dev"
echo ""
echo "📚 See QUICKSTART.md for detailed instructions"

