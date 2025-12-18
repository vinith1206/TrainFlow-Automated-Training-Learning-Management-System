import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrainingsService } from './trainings.service';
import { BulkOperationsService, BulkOperationDto } from './bulk-operations.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Trainings')
@Controller('trainings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrainingsController {
  constructor(
    private readonly trainingsService: TrainingsService,
    private readonly bulkOperationsService: BulkOperationsService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Create training (Admin/Trainer only)' })
  create(@Body() createTrainingDto: CreateTrainingDto, @Request() req) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.trainingsService.create(createTrainingDto, req.user.userId, req.user.role, ipAddress, userAgent);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainings with advanced filters' })
  findAll(
    @Query('status') status?: string,
    @Query('trainerId') trainerId?: string,
    @Query('mode') mode?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('startDateFrom') startDateFrom?: string,
    @Query('startDateTo') startDateTo?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.trainingsService.findAll({
      status: status as any,
      trainerId,
      mode,
      search,
      category,
      startDateFrom: startDateFrom ? new Date(startDateFrom) : undefined,
      startDateTo: startDateTo ? new Date(startDateTo) : undefined,
      sortBy,
      sortOrder,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get training by ID' })
  findOne(@Param('id') id: string) {
    return this.trainingsService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get training statistics' })
  getStats(@Param('id') id: string) {
    return this.trainingsService.getStats(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Update training (Admin/Trainer only)' })
  update(@Param('id') id: string, @Body() updateTrainingDto: UpdateTrainingDto, @Request() req) {
    return this.trainingsService.update(id, updateTrainingDto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete training (Admin only)' })
  remove(@Param('id') id: string, @Request() req) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.trainingsService.remove(id, req.user.userId, req.user.role, ipAddress, userAgent);
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk operations on trainings (Admin only)' })
  bulkOperation(@Body() dto: BulkOperationDto, @Request() req) {
    return this.bulkOperationsService.executeBulkOperation(req.user.userId, dto);
  }
}

