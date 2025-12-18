# ⚡ Quick Vercel Deployment Guide

## 🎯 Fastest Way to Deploy

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/trainflow.git
git push -u origin main
```

### Step 2: Deploy Frontend to Vercel

**Option A: Via Vercel Dashboard (Easiest)**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
5. Click **Deploy**

**Option B: Via CLI**
```bash
cd frontend
npm i -g vercel
vercel login
vercel
```

### Step 3: Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

Then **Redeploy** the project.

### Step 4: Deploy Backend (Choose One)

#### 🚂 Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo
4. Add PostgreSQL service
5. Add Redis service (or use Upstash)
6. Set environment variables (see VERCEL_DEPLOYMENT.md)
7. Deploy

#### 🎨 Render
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Root Directory: `backend`
5. Build: `npm install && npm run build`
6. Start: `npm run start:prod`
7. Add PostgreSQL and Redis
8. Deploy

### Step 5: Update Frontend API URL

In Vercel Dashboard, update `NEXT_PUBLIC_API_URL` to your backend URL and redeploy.

---

## ✅ That's It!

Your app is now live:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app`

For detailed instructions, see `VERCEL_DEPLOYMENT.md`

