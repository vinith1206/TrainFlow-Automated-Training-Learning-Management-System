import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Feedback')
@Controller('trainings/:trainingId/feedback')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Submit feedback' })
  create(@Param('trainingId') trainingId: string, @Body() createFeedbackDto: CreateFeedbackDto, @Request() req) {
    return this.feedbackService.create(trainingId, req.user.userId, createFeedbackDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Get all feedback for a training (Admin/Trainer only)' })
  findAll(@Param('trainingId') trainingId: string) {
    return this.feedbackService.findAll(trainingId);
  }

  @Get('analytics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Get feedback analytics (Admin/Trainer only)' })
  getAnalytics(@Param('trainingId') trainingId: string) {
    return this.feedbackService.getAnalytics(trainingId);
  }
}

