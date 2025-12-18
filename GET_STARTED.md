# 🚀 Let's Get Started!

## Quick Setup (5 minutes)

### Option 1: Automated Setup Script

```bash
# Make script executable (if needed)
chmod +x setup.sh

# Run setup
./setup.sh
```

### Option 2: Manual Setup

#### Step 1: Backend Setup

```bash
cd backend
npm install

# Create .env file
cat > .env << 'EOF'
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

# Setup database
npx prisma migrate dev --name init
npx prisma generate

# Seed database with sample data
npm run prisma:seed

# Start backend (in one terminal)
npm run start:dev
```

Backend will run on **http://localhost:3000**

#### Step 2: Frontend Setup

```bash
# Open new terminal
cd frontend
npm install

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

# Start frontend
npm run dev
```

Frontend will run on **http://localhost:3001**

## 🎯 Test the System

1. **Open Browser**: http://localhost:3001
2. **Login** with:
   - **Admin**: admin@tmds.com / admin123
   - **Trainer**: trainer@tmds.com / trainer123
   - **Participant**: participant@tmds.com / participant123

3. **Check API Docs**: http://localhost:3000/api/docs

## 📋 What You Can Do Now

### As Admin:
- ✅ View dashboard with statistics
- ✅ Create new trainings
- ✅ Manage users
- ✅ Generate reports

### As Trainer:
- ✅ View assigned trainings
- ✅ Upload materials
- ✅ Mark attendance
- ✅ View feedback

### As Participant:
- ✅ View enrolled trainings
- ✅ Access materials
- ✅ Self check-in
- ✅ Submit feedback

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Create database (PostgreSQL)
createdb tmds

# Or use Docker
docker run --name tmds-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:14
```

### Port Already in Use
- Backend: Change `PORT=3001` in backend/.env
- Frontend: Change port in `frontend/package.json` scripts

### Prisma Issues
```bash
cd backend
npx prisma generate
npx prisma migrate reset  # WARNING: This deletes all data
npx prisma migrate dev
npm run prisma:seed
```

## 🎨 Next Steps

1. **Customize UI**: Edit `frontend/app/globals.css` for colors
2. **Add Features**: Extend components in `frontend/components/`
3. **Configure Email**: Update SMTP in `backend/.env`
4. **Deploy**: Follow `DEPLOYMENT.md` for production

## 📚 Documentation

- **QUICKSTART.md** - Detailed setup guide
- **ARCHITECTURE.md** - System design
- **DEPLOYMENT.md** - Production deployment
- **PROJECT_SUMMARY.md** - Feature overview

## 💡 Pro Tips

- Use **Prisma Studio** to view database: `cd backend && npx prisma studio`
- Check **Swagger UI** for API testing: http://localhost:3000/api/docs
- View **backend logs** for debugging
- Check **browser console** for frontend errors

---

**Ready to go!** 🎉

