import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { TrainingMode } from '@prisma/client';

export class CreateTrainingDto {
  @ApiProperty({ example: 'Advanced React Development' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Learn advanced React patterns and best practices', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2025-02-01T09:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-02-01T17:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ enum: TrainingMode, example: TrainingMode.ONLINE })
  @IsEnum(TrainingMode)
  mode: TrainingMode;

  @ApiProperty({ example: 'Conference Room A', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'https://meet.google.com/xxx-yyyy-zzz', required: false })
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiProperty({ example: 'trainer-user-id', required: false })
  @IsOptional()
  @IsString()
  trainerId?: string;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;
}

