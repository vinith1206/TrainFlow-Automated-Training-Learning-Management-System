import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Enrollments')
@Controller('trainings/:trainingId/enrollments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Enroll in training' })
  enroll(@Param('trainingId') trainingId: string, @Request() req) {
    return this.enrollmentsService.enroll(trainingId, req.user.userId);
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Bulk enroll users (Admin/Trainer only)' })
  bulkEnroll(@Param('trainingId') trainingId: string, @Request() req) {
    const userIds = req.body.userIds || [];
    return this.enrollmentsService.bulkEnroll(trainingId, userIds);
  }

  @Post('import')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Import enrollments from Excel (Admin/Trainer only)' })
  importFromExcel(@Param('trainingId') trainingId: string, @UploadedFile() file: Express.Multer.File) {
    return this.enrollmentsService.importFromExcel(trainingId, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all enrollments for a training' })
  findAll(@Param('trainingId') trainingId: string) {
    return this.enrollmentsService.findAll(trainingId);
  }

  @Delete(':userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Remove enrollment (Admin/Trainer only)' })
  remove(@Param('trainingId') trainingId: string, @Param('userId') userId: string) {
    return this.enrollmentsService.remove(trainingId, userId);
  }

  @Post(':userId/complete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Mark enrollment as complete (Admin/Trainer only)' })
  markComplete(@Param('trainingId') trainingId: string, @Param('userId') userId: string) {
    return this.enrollmentsService.markComplete(trainingId, userId);
  }
}

