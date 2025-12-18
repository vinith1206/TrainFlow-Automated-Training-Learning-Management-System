import { Module } from '@nestjs/common';
import { TrainingsController } from './trainings.controller';
import { TrainingsService } from './trainings.service';
import { BulkOperationsService } from './bulk-operations.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { AutomationModule } from '../automation/automation.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, NotificationsModule, EmailModule, AutomationModule, AuditLogsModule, CacheModule],
  controllers: [TrainingsController],
  providers: [TrainingsService, BulkOperationsService],
  exports: [TrainingsService, BulkOperationsService],
})
export class TrainingsModule {}

