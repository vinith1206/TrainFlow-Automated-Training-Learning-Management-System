import { Module } from '@nestjs/common';
import { TrainingTemplatesService } from './training-templates.service';
import { TrainingTemplatesController } from './training-templates.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TrainingTemplatesService],
  controllers: [TrainingTemplatesController],
  exports: [TrainingTemplatesService],
})
export class TrainingTemplatesModule {}

