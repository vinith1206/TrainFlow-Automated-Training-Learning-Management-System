import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { FeedbackModule } from '../feedback/feedback.module';

@Module({
  imports: [FeedbackModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}

