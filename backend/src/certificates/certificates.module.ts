import { Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { AutomationModule } from '../automation/automation.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [AutomationModule, EmailModule],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}

