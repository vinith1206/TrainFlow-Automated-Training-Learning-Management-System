import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateTemplateDto {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  templateData: any;
  isPublic?: boolean;
}

@Injectable()
export class TrainingTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTemplateDto) {
    return this.prisma.trainingTemplate.create({
      data: {
        ...dto,
        createdById: userId,
      },
    });
  }

  async findAll(filters?: {
    category?: string;
    isPublic?: boolean;
    search?: string;
  }) {
    const where: any = {};
    if (filters?.category) where.category = filters.category;
    if (filters?.isPublic !== undefined) where.isPublic = filters.isPublic;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.trainingTemplate.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.trainingTemplate.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async createTrainingFromTemplate(templateId: string, userId: string, overrides?: any) {
    const template = await this.findOne(templateId);
    
    // Increment usage count
    await this.prisma.trainingTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    });

    // Create training from template data
    const trainingData = {
      ...template.templateData,
      ...overrides,
      createdById: userId,
    };

    return this.prisma.training.create({
      data: trainingData,
    });
  }

  async update(id: string, userId: string, dto: Partial<CreateTemplateDto>) {
    const template = await this.findOne(id);
    
    // Check ownership
    if (template.createdById !== userId) {
      throw new NotFoundException('Template not found or access denied');
    }

    return this.prisma.trainingTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    const template = await this.findOne(id);
    
    // Check ownership
    if (template.createdById !== userId) {
      throw new NotFoundException('Template not found or access denied');
    }

    return this.prisma.trainingTemplate.delete({
      where: { id },
    });
  }
}

