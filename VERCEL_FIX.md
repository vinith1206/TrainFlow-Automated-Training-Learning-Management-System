# 🔧 Vercel 404 Error Fix

If you're getting a 404 NOT_FOUND error on Vercel, follow these steps:

## ✅ Solution 1: Remove vercel.json (Recommended)

Vercel auto-detects Next.js projects, so `vercel.json` is not needed and might cause conflicts.

**Steps:**
1. Delete `frontend/vercel.json` (already done)
2. In Vercel Dashboard → Your Project → Settings → General:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: Leave empty (auto-detected)
   - **Output Directory**: Leave empty (auto-detected)
   - **Install Command**: Leave empty (auto-detected)

3. **Redeploy** the project

## ✅ Solution 2: Check Root Directory

Make sure in Vercel Dashboard:
- **Root Directory** is set to `frontend` (not the root of the repo)

## ✅ Solution 3: Verify Build Settings

In Vercel Dashboard → Settings → General:

- **Node.js Version**: 18.x or 20.x
- **Build Command**: (empty - auto-detected)
- **Output Directory**: (empty - auto-detected)
- **Install Command**: (empty - auto-detected)

## ✅ Solution 4: Check Build Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the failed deployment
3. Check the build logs for errors
4. Common issues:
   - Missing dependencies
   - TypeScript errors
   - Environment variables not set

## ✅ Solution 5: Manual Configuration (If Auto-Detect Fails)

If auto-detection doesn't work, manually set:

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/.next`
- **Install Command**: `cd frontend && npm install`

## 🐛 Common Issues

### Issue: Build Fails
**Fix**: Check build logs, ensure all dependencies are in `package.json`

### Issue: 404 on All Routes
**Fix**: Make sure Root Directory is set to `frontend`

### Issue: Environment Variables Not Working
**Fix**: Set `NEXT_PUBLIC_API_URL` in Vercel Dashboard → Settings → Environment Variables

## 📝 Quick Fix Steps

1. **Delete vercel.json** (if exists) ✅ Already done
2. **Set Root Directory to `frontend`** in Vercel Dashboard
3. **Clear all manual build settings** (let Vercel auto-detect)
4. **Redeploy**

## 🚀 After Fix

Once fixed, your app should be accessible at:
- `https://your-project.vercel.app`

If issues persist, check the deployment logs in Vercel Dashboard.

