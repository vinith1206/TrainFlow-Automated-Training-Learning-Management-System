import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great training session!', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  trainerRating?: number;

  @ApiProperty({ example: 'Excellent trainer', required: false })
  @IsOptional()
  @IsString()
  trainerComment?: string;
}

