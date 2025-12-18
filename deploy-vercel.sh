#!/bin/bash

echo "🚀 TrainFlow - Vercel Deployment Script"
echo "========================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Navigate to frontend directory
cd frontend

echo "📋 Pre-deployment checklist:"
echo "1. Make sure your code is committed to Git"
echo "2. Set up your backend API (Railway, Render, etc.)"
echo "3. Get your backend API URL"
echo "4. Update NEXT_PUBLIC_API_URL in Vercel dashboard after deployment"
echo ""
read -p "Press Enter to continue with deployment..."

# Login to Vercel (if not already logged in)
echo ""
echo "🔐 Checking Vercel authentication..."
vercel whoami &> /dev/null || vercel login

# Deploy
echo ""
echo "🚀 Deploying to Vercel..."
vercel

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📝 Next steps:"
echo "1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables"
echo "2. Add: NEXT_PUBLIC_API_URL = https://your-backend-url.com/api"
echo "3. Redeploy the project"
echo ""
echo "🌐 Your app will be available at: https://your-project.vercel.app"

