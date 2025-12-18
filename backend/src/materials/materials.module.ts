import { Module } from '@nestjs/common';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { MaterialVersionsService } from './material-versions.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [NotificationsModule, EmailModule, PrismaModule],
  controllers: [MaterialsController],
  providers: [MaterialsService, MaterialVersionsService],
  exports: [MaterialsService, MaterialVersionsService],
})
export class MaterialsModule {}

