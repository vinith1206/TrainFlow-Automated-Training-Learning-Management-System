import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Attendance')
@Controller('trainings/:trainingId/attendance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Mark attendance (Admin/Trainer only)' })
  markAttendance(@Param('trainingId') trainingId: string, @Body() markAttendanceDto: MarkAttendanceDto, @Request() req) {
    return this.attendanceService.markAttendance(trainingId, markAttendanceDto, req.user.userId);
  }

  @Post('check-in')
  @ApiOperation({ summary: 'Self check-in for training' })
  selfCheckIn(@Param('trainingId') trainingId: string, @Request() req) {
    return this.attendanceService.selfCheckIn(trainingId, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records for a training' })
  findAll(@Param('trainingId') trainingId: string) {
    return this.attendanceService.findAll(trainingId);
  }

  @Get('rate')
  @ApiOperation({ summary: 'Get attendance rate for a training' })
  getAttendanceRate(@Param('trainingId') trainingId: string) {
    return this.attendanceService.getAttendanceRate(trainingId);
  }
}

