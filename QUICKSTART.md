# Quick Start Guide

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ running
- Redis (optional, for background jobs)

### Step 1: Clone and Setup Backend

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/tmds?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
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

# Run migrations
npx prisma migrate dev
npx prisma generate

# Seed database
npm run prisma:seed

# Start backend
npm run start:dev
```

Backend will run on http://localhost:3000

### Step 2: Setup Frontend

```bash
cd frontend
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

# Start frontend
npm run dev
```

Frontend will run on http://localhost:3001

### Step 3: Login

Open http://localhost:3001/login

**Default Credentials:**
- **Admin**: admin@tmds.com / admin123
- **Trainer**: trainer@tmds.com / trainer123
- **Participant**: participant@tmds.com / participant123

## 📋 API Documentation

Once backend is running, visit:
http://localhost:3000/api/docs

## 🎯 Key Features Implemented

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Admin, Trainer, Participant)

✅ **Training Management**
- Create, read, update, delete trainings
- Training status tracking
- Multiple training modes (Online, Offline, Hybrid)

✅ **Material Distribution**
- Upload pre-work and post-training materials
- Automatic distribution on enrollment
- Support for files and external links

✅ **Enrollment System**
- Individual and bulk enrollment
- Excel import for bulk enrollment
- Enrollment status tracking

✅ **Attendance Tracking**
- Manual marking by trainers
- Self check-in by participants
- Attendance rate calculation

✅ **Feedback System**
- Submit feedback with ratings
- Feedback analytics
- Trainer performance tracking

✅ **Reports**
- Attendance reports (Excel)
- Completion reports (Excel)
- Feedback summary reports (Excel)

✅ **Notifications**
- In-app notifications
- Email notifications (when SMTP configured)

## 🔧 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `createdb tmds`

### Port Already in Use
- Backend: Change PORT in .env
- Frontend: Change port in package.json scripts

### Prisma Issues
- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` for new migrations

## 📚 Next Steps

1. **Configure Email**: Update SMTP settings in backend/.env
2. **Add More Features**: Extend the system based on your needs
3. **Deploy**: Follow DEPLOYMENT.md for production setup
4. **Customize UI**: Modify frontend components to match your brand

## 🎨 UI Customization

The frontend uses:
- **Tailwind CSS** for styling
- **ShadCN UI** components (can be extended)
- **Dark/Light mode** support (via next-themes)

To customize:
1. Edit `frontend/app/globals.css` for theme colors
2. Modify components in `frontend/components/`
3. Update Tailwind config in `frontend/tailwind.config.ts`

## 📖 Documentation

- **Architecture**: See ARCHITECTURE.md
- **Deployment**: See DEPLOYMENT.md
- **API Docs**: http://localhost:3000/api/docs (when running)

## 🐛 Known Limitations

- File uploads are stored locally (use S3 in production)
- Email requires SMTP configuration
- Redis is optional but recommended for production
- Some features may need additional UI screens (can be added)

## 💡 Tips

- Use Swagger UI to test APIs: http://localhost:3000/api/docs
- Check browser console for frontend errors
- Check backend logs for API errors
- Use Prisma Studio to view database: `npx prisma studio`

