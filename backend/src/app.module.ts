import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TrainingsModule } from './trainings/trainings.module';
import { MaterialsModule } from './materials/materials.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EmailModule } from './email/email.module';
import { AiModule } from './ai/ai.module';
import { AutomationModule } from './automation/automation.module';
import { CertificatesModule } from './certificates/certificates.module';
import { ScheduledReportsModule } from './scheduled-reports/scheduled-reports.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { TrainingTemplatesModule } from './training-templates/training-templates.module';
import { CommentsModule } from './comments/comments.module';
import { TwoFactorModule } from './auth/two-factor/two-factor.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TrainingsModule,
    MaterialsModule,
    EnrollmentsModule,
    AttendanceModule,
    FeedbackModule,
    ReportsModule,
    NotificationsModule,
    EmailModule,
    AiModule,
    AutomationModule,
    CertificatesModule,
    ScheduledReportsModule,
    AuditLogsModule,
    TrainingTemplatesModule,
    CommentsModule,
    TwoFactorModule,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

