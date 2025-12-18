import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UserRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MaterialsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

  async create(trainingId: string, createMaterialDto: CreateMaterialDto, file?: Express.Multer.File, userId?: string) {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      include: { enrollments: true },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;
    let mimeType: string | null = null;

    if (file) {
      // In production, upload to S3. For now, save locally
      const uploadDir = process.env.UPLOAD_DEST || './uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, file.buffer);
      fileUrl = `/uploads/${fileName}`;
      fileSize = file.size;
      mimeType = file.mimetype;
      
      // Support video files
      if (mimeType.startsWith('video/')) {
        // For video files, we'll store them the same way
        // In production, consider using a video streaming service
      }
    }

    const material = await this.prisma.trainingMaterial.create({
      data: {
        trainingId,
        name: createMaterialDto.name,
        description: createMaterialDto.description,
        type: createMaterialDto.type,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        externalLink: createMaterialDto.externalLink,
        isRequired: createMaterialDto.isRequired ?? true,
      },
    });

    // Auto-distribute pre-work materials
    if (createMaterialDto.type === 'PRE_WORK' && training.enrollments.length > 0) {
      await this.distributeMaterial(material, training);
    }

    return material;
  }

  private async distributeMaterial(material: any, training: any) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { trainingId: training.id },
      include: { user: true },
    });

    for (const enrollment of enrollments) {
      // Create notification
      await this.notificationsService.create({
        userId: enrollment.userId,
        title: 'New Pre-work Material Available',
        message: `New material "${material.name}" is available for ${training.name}`,
        type: 'INFO',
        link: `/trainings/${training.id}/materials`,
      });

      // Send email
      await this.emailService.sendMaterialNotification(
        enrollment.user.email,
        enrollment.user.firstName,
        training.name,
        material.name,
        material.fileUrl || material.externalLink,
      );
    }

    // Mark as distributed
    await this.prisma.trainingMaterial.update({
      where: { id: material.id },
      data: { distributedAt: new Date() },
    });
  }

  async findAll(trainingId: string) {
    return this.prisma.trainingMaterial.findMany({
      where: { trainingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const material = await this.prisma.trainingMaterial.findUnique({
      where: { id },
      include: { training: true },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    // Only Admin or trainer can delete
    if (userRole !== UserRole.ADMIN && material.training.trainerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this material');
    }

    return this.prisma.trainingMaterial.delete({
      where: { id },
    });
  }
}

