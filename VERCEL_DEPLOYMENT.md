# 🚀 Vercel Deployment Guide for TrainFlow

This guide will help you deploy TrainFlow to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket Account**: Your code should be in a Git repository
3. **Database**: PostgreSQL database (recommended: [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app))
4. **Redis**: Redis instance (recommended: [Upstash](https://upstash.com) or [Redis Cloud](https://redis.com/cloud))

## 🏗️ Architecture Overview

TrainFlow consists of:
- **Frontend**: Next.js app (deploy to Vercel)
- **Backend**: NestJS API (deploy separately - see options below)

## 📦 Option 1: Deploy Frontend Only (Recommended for Quick Start)

If you deploy the backend separately (Railway, Render, etc.), you only need to deploy the frontend to Vercel.

### Step 1: Prepare Frontend

1. **Update API URL**: Update `frontend/.env.local` or set environment variables in Vercel:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   ```

2. **Update Next.js Config** (already done):
   ```js
   // frontend/next.config.js
   images: {
     domains: ['your-backend-url.com', 'localhost'],
   }
   ```

### Step 2: Deploy to Vercel

#### Method A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? trainflow-frontend
# - Directory? ./
# - Override settings? No
```

#### Method B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Add Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app/api`)

5. Click **Deploy**

### Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

---

## 🔧 Option 2: Deploy Both Frontend and Backend to Vercel

Vercel can host serverless functions, but NestJS needs adaptation. Here's how:

### Step 1: Convert Backend to Vercel Serverless Functions

Create `api/index.ts` in the root directory:

```typescript
// api/index.ts
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../backend/src/app.module';
import express from 'express';

let cachedApp: any;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  await app.init();
  
  cachedApp = expressApp;
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  return app(req, res);
}
```

### Step 2: Update vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

**Note**: This approach is complex and may have limitations with NestJS features like WebSockets, long-running processes, etc.

---

## 🗄️ Database Setup

### Option A: Supabase (Recommended)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Get connection string from Settings → Database
4. Run migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```
5. Seed database (optional):
   ```bash
   npm run prisma:seed
   ```

### Option B: Neon

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Get connection string
4. Run migrations (same as above)

### Option C: Railway

1. Sign up at [railway.app](https://railway.app)
2. Create PostgreSQL service
3. Get connection string
4. Run migrations (same as above)

---

## 🔴 Redis Setup

### Option A: Upstash (Recommended for Vercel)

1. Sign up at [upstash.com](https://upstash.com)
2. Create Redis database
3. Get connection details:
   - Host
   - Port
   - Password
4. Update backend environment variables

### Option B: Redis Cloud

1. Sign up at [redis.com/cloud](https://redis.com/cloud)
2. Create database
3. Get connection details

---

## 🚀 Deploy Backend Separately (Recommended)

### Option 1: Railway

1. Sign up at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Add PostgreSQL service
5. Add Redis service (or use Upstash)
6. Set environment variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_HOST=${{Redis.REDIS_HOST}}
   REDIS_PORT=${{Redis.REDIS_PORT}}
   REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
   JWT_SECRET=your-secret-key
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
7. Deploy

### Option 2: Render

1. Sign up at [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
5. Add PostgreSQL database
6. Add Redis instance
7. Set environment variables
8. Deploy

### Option 3: Heroku

1. Sign up at [heroku.com](https://heroku.com)
2. Create new app
3. Add PostgreSQL addon
4. Add Redis addon
5. Deploy:
   ```bash
   heroku git:remote -a your-app-name
   git push heroku main
   ```

---

## 📝 Environment Variables Checklist

### Frontend (Vercel)
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL

### Backend (Railway/Render/etc.)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Secret key for JWT tokens
- [ ] `JWT_EXPIRES_IN` - Token expiration (e.g., "7d")
- [ ] `FRONTEND_URL` - Frontend URL (Vercel app URL)
- [ ] `REDIS_HOST` - Redis host
- [ ] `REDIS_PORT` - Redis port
- [ ] `REDIS_PASSWORD` - Redis password (if required)
- [ ] `SMTP_HOST` - Email SMTP host
- [ ] `SMTP_PORT` - Email SMTP port
- [ ] `SMTP_USER` - Email SMTP user
- [ ] `SMTP_PASS` - Email SMTP password
- [ ] `SMTP_FROM` - Email sender address
- [ ] `NODE_ENV` - Set to "production"
- [ ] `PORT` - Server port (usually auto-set by platform)

---

## 🔍 Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend API accessible
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] Test login functionality
- [ ] Test API endpoints
- [ ] Check logs for errors

---

## 🐛 Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your Vercel app URL
- Check CORS configuration in `backend/src/main.ts`

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check if database allows connections from your deployment platform
- Run migrations: `npx prisma migrate deploy`

### Build Errors
- Check Node.js version (Vercel uses Node 18+ by default)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### API Not Found
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is running and accessible
- Test backend URL directly in browser

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)

---

## 🎉 Success!

Once deployed, your TrainFlow application will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app` (or your chosen platform)

Happy deploying! 🚀

