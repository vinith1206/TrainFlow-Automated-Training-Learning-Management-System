import { Controller, Get, Param, UseGuards, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TRAINER)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('attendance/:trainingId')
  @ApiOperation({ summary: 'Generate attendance report (Admin/Trainer only)' })
  async generateAttendanceReport(
    @Param('trainingId') trainingId: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.reportsService.generateAttendanceReport(trainingId);
      const filePath = result.filePath;
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Report file not found' });
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
      return res.sendFile(path.resolve(filePath));
    } catch (error) {
      return res.status(500).json({ message: error.message || 'Failed to generate report' });
    }
  }

  @Get('completion/:trainingId')
  @ApiOperation({ summary: 'Generate completion report (Admin/Trainer only)' })
  async generateCompletionReport(
    @Param('trainingId') trainingId: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.reportsService.generateCompletionReport(trainingId);
      const filePath = result.filePath;
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Report file not found' });
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
      return res.sendFile(path.resolve(filePath));
    } catch (error) {
      return res.status(500).json({ message: error.message || 'Failed to generate report' });
    }
  }

  @Get('feedback/:trainingId')
  @ApiOperation({ summary: 'Generate feedback report (Admin/Trainer only)' })
  async generateFeedbackReport(
    @Param('trainingId') trainingId: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.reportsService.generateFeedbackReport(trainingId);
      const filePath = result.filePath;
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Report file not found' });
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
      return res.sendFile(path.resolve(filePath));
    } catch (error) {
      return res.status(500).json({ message: error.message || 'Failed to generate report' });
    }
  }
}
