import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { MaterialType } from '@prisma/client';

export class CreateMaterialDto {
  @ApiProperty({ example: 'Pre-work Reading Material' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Please review before the training', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: MaterialType, example: MaterialType.PRE_WORK })
  @IsEnum(MaterialType)
  type: MaterialType;

  @ApiProperty({ example: 'https://example.com/resource', required: false })
  @IsOptional()
  @IsUrl()
  externalLink?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}

