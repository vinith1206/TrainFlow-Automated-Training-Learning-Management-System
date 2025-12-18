import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('AI Features')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TRAINER)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('feedback/summarize/:trainingId')
  @ApiOperation({ summary: 'Get AI-powered feedback summary (Admin/Trainer only)' })
  async summarizeFeedback(@Param('trainingId') trainingId: string) {
    return this.aiService.summarizeFeedback(trainingId);
  }

  @Get('effectiveness/:trainingId')
  @ApiOperation({ summary: 'Calculate training effectiveness score (Admin/Trainer only)' })
  async getEffectivenessScore(@Param('trainingId') trainingId: string) {
    const score = await this.aiService.calculateEffectivenessScore(trainingId);
    return { trainingId, effectivenessScore: score };
  }

  @Get('recommendations/trainer/:trainerId')
  @ApiOperation({ summary: 'Get AI recommendations for trainer (Admin/Trainer only)' })
  async getTrainerRecommendations(@Param('trainerId') trainerId: string) {
    return this.aiService.getTrainerRecommendations(trainerId);
  }
}

