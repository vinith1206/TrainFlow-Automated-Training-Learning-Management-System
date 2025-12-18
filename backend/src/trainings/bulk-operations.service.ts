import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface BulkOperationDto {
  trainingIds: string[];
  action: 'DELETE' | 'UPDATE_STATUS' | 'UPDATE_MODE' | 'ASSIGN_TRAINER';
  data?: {
    status?: string;
    mode?: string;
    trainerId?: string;
  };
}

@Injectable()
export class BulkOperationsService {
  constructor(private prisma: PrismaService) {}

  async executeBulkOperation(userId: string, dto: BulkOperationDto) {
    if (!dto.trainingIds || dto.trainingIds.length === 0) {
      throw new BadRequestException('No training IDs provided');
    }

    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    for (const trainingId of dto.trainingIds) {
      try {
        switch (dto.action) {
          case 'DELETE':
            await this.prisma.training.delete({
              where: { id: trainingId },
            });
            results.success.push(trainingId);
            break;

          case 'UPDATE_STATUS':
            if (!dto.data?.status) {
              throw new BadRequestException('Status is required for UPDATE_STATUS action');
            }
            await this.prisma.training.update({
              where: { id: trainingId },
              data: { status: dto.data.status as any },
            });
            results.success.push(trainingId);
            break;

          case 'UPDATE_MODE':
            if (!dto.data?.mode) {
              throw new BadRequestException('Mode is required for UPDATE_MODE action');
            }
            await this.prisma.training.update({
              where: { id: trainingId },
              data: { mode: dto.data.mode as any },
            });
            results.success.push(trainingId);
            break;

          case 'ASSIGN_TRAINER':
            if (!dto.data?.trainerId) {
              throw new BadRequestException('Trainer ID is required for ASSIGN_TRAINER action');
            }
            await this.prisma.training.update({
              where: { id: trainingId },
              data: { trainerId: dto.data.trainerId },
            });
            results.success.push(trainingId);
            break;

          default:
            throw new BadRequestException(`Unknown action: ${dto.action}`);
        }
      } catch (error: any) {
        results.failed.push({
          id: trainingId,
          error: error.message || 'Unknown error',
        });
      }
    }

    return {
      total: dto.trainingIds.length,
      successCount: results.success.length,
      failedCount: results.failed.length,
      results,
    };
  }
}

