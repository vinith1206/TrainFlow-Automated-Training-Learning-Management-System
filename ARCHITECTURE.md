# Training Materials Distribution System (TMDS) - Architecture

## System Overview

TMDS is a modern, enterprise-ready web application for managing training programs, automating material distribution, tracking attendance, and collecting feedback.

## Architecture Pattern

**Monorepo Structure:**
```
tmds/
├── backend/          # NestJS API server
├── frontend/         # Next.js application
├── shared/           # Shared types/utilities
└── docs/            # Documentation
```

## Technology Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **File Storage**: Local filesystem (S3-ready abstraction)
- **Job Queue**: Bull (Redis) for background jobs
- **Email**: Nodemailer (SMTP)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI + Radix UI
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Database Schema

### Core Entities

1. **User** (Admin, Trainer, Participant)
2. **Training** (Course details, schedule)
3. **TrainingMaterial** (Pre-work, Post-work)
4. **Enrollment** (User-Training relationship)
5. **Attendance** (Session tracking)
6. **Feedback** (Ratings, comments)
7. **Notification** (In-app notifications)
8. **Report** (Generated reports metadata)

## API Architecture

### RESTful Endpoints

**Authentication:**
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `POST /auth/logout`

**Trainings:**
- `GET /trainings` (with filters)
- `GET /trainings/:id`
- `POST /trainings`
- `PATCH /trainings/:id`
- `DELETE /trainings/:id`

**Materials:**
- `POST /trainings/:id/materials`
- `GET /trainings/:id/materials`
- `DELETE /materials/:id`
- `GET /materials/:id/download` (signed URL)

**Enrollments:**
- `POST /trainings/:id/enroll`
- `POST /trainings/:id/enroll/bulk` (Excel import)
- `GET /trainings/:id/enrollments`
- `DELETE /enrollments/:id`

**Attendance:**
- `POST /trainings/:id/attendance`
- `GET /trainings/:id/attendance`
- `PATCH /attendance/:id`

**Feedback:**
- `POST /trainings/:id/feedback`
- `GET /trainings/:id/feedback`
- `GET /feedback/analytics`

**Reports:**
- `GET /reports/attendance/:trainingId`
- `GET /reports/completion/:trainingId`
- `GET /reports/feedback/:trainingId`
- `POST /reports/generate` (async)

**Users:**
- `GET /users` (Admin only)
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`

## Automation Workflows

### 1. Pre-work Distribution
```
Enrollment Created
  → Trigger: Auto-send pre-work materials
  → Email notification
  → In-app notification
```

### 2. Post-training Distribution
```
Training Status = Completed
  → Trigger: Auto-send post-training materials
  → Email notification
  → In-app notification
```

### 3. Feedback Collection
```
Training End Time Passed
  → Trigger: Auto-send feedback form
  → Email reminder
  → In-app notification
```

### 4. Certificate Generation
```
Training Completed + Attendance >= 80%
  → Auto-generate PDF certificate
  → Email to participant
  → Available in dashboard
```

### 5. Report Generation
```
Scheduled (Daily/Weekly)
  → Generate Excel reports
  → Email to admins
  → Store in system
```

## Security Measures

1. **Authentication**: JWT tokens with refresh mechanism
2. **Authorization**: Role-based middleware (RBAC)
3. **Input Validation**: DTOs with class-validator
4. **File Security**: Signed URLs for downloads
5. **Rate Limiting**: Prevent abuse
6. **Audit Logs**: Track admin actions
7. **SQL Injection**: Prisma ORM protection
8. **XSS Protection**: Input sanitization

## Scalability Considerations

1. **Database Indexing**: On frequently queried fields
2. **Caching**: Redis for session and frequently accessed data
3. **Background Jobs**: Bull queue for heavy operations
4. **File Storage**: S3-compatible storage for production
5. **CDN**: For static assets and materials
6. **Load Balancing**: Ready for horizontal scaling

## Deployment

### Development
- Docker Compose for local PostgreSQL + Redis
- Hot reload for both frontend and backend

### Production
- Backend: Docker container on cloud (AWS/GCP/Azure)
- Frontend: Vercel/Netlify or containerized
- Database: Managed PostgreSQL
- File Storage: S3 or equivalent
- Redis: Managed Redis service

## Performance Targets

- API Response Time: < 200ms (p95)
- Page Load Time: < 2s
- File Upload: Support up to 100MB
- Concurrent Users: 100+ per training
- Database Queries: Optimized with proper indexing

