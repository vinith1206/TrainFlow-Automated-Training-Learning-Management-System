import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomationService } from './automation.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ScheduleModule, NotificationsModule, EmailModule],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationModule {}

