import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateMaterialVersionDto {
  materialId: string;
  name: string;
  description?: string;
  fileUrl?: string;
  externalLink?: string;
  mimeType?: string;
  fileSize?: number;
  fileName?: string;
  changeNotes?: string;
}

@Injectable()
export class MaterialVersionsService {
  constructor(private prisma: PrismaService) {}

  async createVersion(userId: string, dto: CreateMaterialVersionDto) {
    // Get current material to find latest version
    const material = await this.prisma.trainingMaterial.findUnique({
      where: { id: dto.materialId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    const nextVersion = material.versions.length > 0 
      ? material.versions[0].version + 1 
      : 1;

    // Create new version
    const version = await this.prisma.materialVersion.create({
      data: {
        ...dto,
        version: nextVersion,
        createdById: userId,
      },
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

    // Update material with new version data
    await this.prisma.trainingMaterial.update({
      where: { id: dto.materialId },
      data: {
        name: dto.name,
        description: dto.description,
        fileUrl: dto.fileUrl,
        externalLink: dto.externalLink,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        fileName: dto.fileName,
      },
    });

    return version;
  }

  async getVersions(materialId: string) {
    return this.prisma.materialVersion.findMany({
      where: { materialId },
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
      orderBy: { version: 'desc' },
    });
  }

  async rollbackToVersion(materialId: string, version: number, userId: string) {
    const versionData = await this.prisma.materialVersion.findUnique({
      where: {
        materialId_version: {
          materialId,
          version,
        },
      },
    });

    if (!versionData) {
      throw new NotFoundException('Version not found');
    }

    // Update material to version data
    await this.prisma.trainingMaterial.update({
      where: { id: materialId },
      data: {
        name: versionData.name,
        description: versionData.description,
        fileUrl: versionData.fileUrl,
        externalLink: versionData.externalLink,
        mimeType: versionData.mimeType,
        fileSize: versionData.fileSize,
        fileName: versionData.fileName,
      },
    });

    // Create new version with rollback note
    return this.createVersion(userId, {
      materialId,
      name: versionData.name,
      description: versionData.description,
      fileUrl: versionData.fileUrl,
      externalLink: versionData.externalLink,
      mimeType: versionData.mimeType,
      fileSize: versionData.fileSize,
      fileName: versionData.fileName,
      changeNotes: `Rolled back to version ${version}`,
    });
  }
}

