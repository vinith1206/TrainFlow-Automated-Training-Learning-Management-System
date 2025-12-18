#!/bin/bash

echo "🚀 Starting TMDS Development Servers"
echo "====================================="
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found!"
    echo "📝 Please create backend/.env file first (see GET_STARTED.md)"
    exit 1
fi

# Check if .env.local exists
if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  frontend/.env.local not found!"
    echo "📝 Creating default .env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > frontend/.env.local
fi

echo "✅ Configuration files found"
echo ""
echo "Starting servers..."
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start backend in background
cd backend
npm run start:dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for user interrupt
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for processes
wait

