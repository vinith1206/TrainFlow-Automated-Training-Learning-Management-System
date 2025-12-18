import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { MaterialsService } from '../materials/materials.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class EnrollmentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private materialsService: MaterialsService,
  ) {}

  async enroll(trainingId: string, userId: string) {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    // Check if already enrolled
    const existing = await this.prisma.enrollment.findUnique({
      where: {
        trainingId_userId: {
          trainingId,
          userId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Already enrolled in this training');
    }

    // Check max participants
    const currentCount = await this.prisma.enrollment.count({
      where: { trainingId },
    });

    if (training.maxParticipants && currentCount >= training.maxParticipants) {
      throw new BadRequestException('Training is full');
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        trainingId,
        userId,
      },
      include: {
        user: true,
        training: {
          include: {
            trainer: true,
          },
        },
      },
    });

    // Auto-distribute pre-work materials
    const preWorkMaterials = await this.prisma.trainingMaterial.findMany({
      where: {
        trainingId,
        type: 'PRE_WORK',
      },
    });

    for (const material of preWorkMaterials) {
      await this.notificationsService.create({
        userId,
        title: 'New Pre-work Material Available',
        message: `New material "${material.name}" is available for ${training.name}`,
        type: 'INFO',
        link: `/trainings/${trainingId}/materials`,
      });
    }

    // Send welcome email
    await this.emailService.sendEnrollmentConfirmation(
      enrollment.user.email,
      enrollment.user.firstName,
      training.name,
      training.startDate,
    );

    return enrollment;
  }

  async bulkEnroll(trainingId: string, userIds: string[]) {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    const enrollments = [];
    for (const userId of userIds) {
      try {
        const enrollment = await this.enroll(trainingId, userId);
        enrollments.push(enrollment);
      } catch (error) {
        // Skip if already enrolled
        continue;
      }
    }

    return enrollments;
  }

  async importFromExcel(trainingId: string, file: Express.Multer.File) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as Buffer);

    const worksheet = workbook.getWorksheet(1);
    const userIds: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const email = row.getCell(1).value?.toString();
      if (email) {
        // Find user by email
        this.prisma.user
          .findUnique({
            where: { email },
            select: { id: true },
          })
          .then((user) => {
            if (user) {
              userIds.push(user.id);
            }
          });
      }
    });

    // Wait a bit for all promises
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return this.bulkEnroll(trainingId, userIds);
  }

  async findAll(trainingId: string) {
    return this.prisma.enrollment.findMany({
      where: { trainingId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });
  }

  async remove(trainingId: string, userId: string) {
    return this.prisma.enrollment.delete({
      where: {
        trainingId_userId: {
          trainingId,
          userId,
        },
      },
    });
  }

  async markComplete(trainingId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        trainingId_userId: {
          trainingId,
          userId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return this.prisma.enrollment.update({
      where: {
        trainingId_userId: {
          trainingId,
          userId,
        },
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }
}

