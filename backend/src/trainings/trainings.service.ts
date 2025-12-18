import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { TrainingStatus, UserRole } from '@prisma/client';
import { AutomationService } from '../automation/automation.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class TrainingsService {
  constructor(
    private prisma: PrismaService,
    private automationService: AutomationService,
    private auditLogsService: AuditLogsService,
    private cacheService: CacheService,
  ) {}

  async create(createTrainingDto: CreateTrainingDto, userId: string, userRole: UserRole, ipAddress?: string, userAgent?: string) {
    // Only Admin and Trainer can create trainings
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.TRAINER) {
      throw new ForbiddenException('Only admins and trainers can create trainings');
    }

    const training = await this.prisma.training.create({
      data: {
        ...createTrainingDto,
        trainerId: createTrainingDto.trainerId || userId,
        createdById: userId,
        status: TrainingStatus.DRAFT,
      },
      include: {
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log audit
    this.auditLogsService.create({
      userId,
      action: 'CREATE',
      entityType: 'Training',
      entityId: training.id,
      details: { name: training.name, status: training.status },
      ipAddress,
      userAgent,
    }).catch(() => {});

    // Invalidate cache
    await this.cacheService.invalidate('trainings:*');

    return training;
  }

  async findAll(filters?: {
    status?: TrainingStatus;
    trainerId?: string;
    mode?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;
    const orderBy: any = filters?.sortBy 
      ? { [filters.sortBy]: filters.sortOrder || 'asc' }
      : { createdAt: 'desc' };

    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.trainerId) {
      where.trainerId = filters.trainerId;
    }
    if (filters?.mode) {
      where.mode = filters.mode;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Try cache first
    const cacheKey = `trainings:${JSON.stringify(filters)}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const [data, total] = await Promise.all([
      this.prisma.training.findMany({
        where,
        include: {
          trainer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              materials: true,
              feedbacks: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.training.count({ where }),
    ]);

    const result = {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, result, 300);

    return result;
  }

  async findOne(id: string) {
    // Try cache first
    const cacheKey = `training:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const training = await this.prisma.training.findUnique({
      where: { id },
      include: {
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        materials: true,
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        attendance: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        feedbacks: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            materials: true,
            feedbacks: true,
            attendance: true,
          },
        },
      },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    // Cache for 10 minutes
    await this.cacheService.set(cacheKey, training, 600);

    return training;
  }

  async update(id: string, updateTrainingDto: UpdateTrainingDto, userId: string, userRole: UserRole) {
    const training = await this.findOne(id);

    // Only Admin or the trainer who created it can update
    if (userRole !== UserRole.ADMIN && training.createdById !== userId) {
      throw new ForbiddenException('You do not have permission to update this training');
    }

    // Check if date changed for reschedule notification
    const oldStartDate = training.startDate;
    const newStartDate = updateTrainingDto.startDate ? new Date(updateTrainingDto.startDate) : null;

    const updated = await this.prisma.training.update({
      where: { id },
      data: updateTrainingDto,
      include: {
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send reschedule notification if date changed
    if (newStartDate && oldStartDate.getTime() !== newStartDate.getTime()) {
      await this.automationService.notifyTrainingReschedule(
        id,
        oldStartDate,
        newStartDate,
      );
    }

    // Log audit
    this.auditLogsService.create({
      userId,
      action: 'UPDATE',
      entityType: 'Training',
      entityId: id,
      details: { changes: updateTrainingDto },
    }).catch(() => {});

    // Invalidate cache
    await this.cacheService.invalidate('trainings:*');
    await this.cacheService.del(`training:${id}`);

    return updated;
  }

  async remove(id: string, userId: string, userRole: UserRole, ipAddress?: string, userAgent?: string) {
    const training = await this.findOne(id);

    // Only Admin can delete
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete trainings');
    }

    const deleted = await this.prisma.training.delete({
      where: { id },
    });

    // Log audit
    this.auditLogsService.create({
      userId,
      action: 'DELETE',
      entityType: 'Training',
      entityId: id,
      details: { name: training.name },
      ipAddress,
      userAgent,
    }).catch(() => {});

    // Invalidate cache
    await this.cacheService.invalidate('trainings:*');
    await this.cacheService.del(`training:${id}`);

    return deleted;
  }

  async getStats(id: string) {
    const training = await this.findOne(id);

    const totalEnrollments = training.enrollments.length;
    const completedEnrollments = training.enrollments.filter((e) => e.status === 'COMPLETED').length;
    const totalAttendance = training.attendance.length;
    const presentCount = training.attendance.filter((a) => a.status === 'PRESENT').length;
    const totalFeedbacks = training.feedbacks.length;
    const avgRating =
      totalFeedbacks > 0
        ? training.feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
        : 0;

    return {
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
      totalAttendance,
      attendanceRate: totalEnrollments > 0 ? (presentCount / totalEnrollments) * 100 : 0,
      totalFeedbacks,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }
}

