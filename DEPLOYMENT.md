# Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (for background jobs)
- npm or yarn

## Backend Deployment

### 1. Environment Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your production values
```

### 2. Database Migration

```bash
npx prisma migrate deploy
npx prisma generate
npm run prisma:seed
```

### 3. Build and Start

```bash
npm install
npm run build
npm run start:prod
```

### Docker Deployment (Recommended)

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## Frontend Deployment

### 1. Environment Setup

```bash
cd frontend
# Create .env.local
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### 2. Build and Start

```bash
npm install
npm run build
npm run start
```

### Vercel Deployment (Recommended)

1. Connect your repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
3. Deploy

## Production Checklist

- [ ] Set secure JWT secrets
- [ ] Configure SMTP for email
- [ ] Set up file storage (S3 or equivalent)
- [ ] Configure Redis for production
- [ ] Set up SSL certificates
- [ ] Configure CORS properly
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for database
- [ ] Set up rate limiting
- [ ] Enable audit logging

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@host:5432/tmds
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
REDIS_HOST=your-redis-host
REDIS_PORT=6379
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

