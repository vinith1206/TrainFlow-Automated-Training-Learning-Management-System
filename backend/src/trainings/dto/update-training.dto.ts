import { PartialType } from '@nestjs/swagger';
import { CreateTrainingDto } from './create-training.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TrainingStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTrainingDto extends PartialType(CreateTrainingDto) {
  @ApiProperty({ enum: TrainingStatus, required: false })
  @IsOptional()
  @IsEnum(TrainingStatus)
  status?: TrainingStatus;
}

