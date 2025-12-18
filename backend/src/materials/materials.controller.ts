import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { MaterialVersionsService } from './material-versions.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Materials')
@Controller('trainings/:trainingId/materials')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MaterialsController {
  constructor(
    private readonly materialsService: MaterialsService,
    private readonly materialVersionsService: MaterialVersionsService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload material (Admin/Trainer only)' })
  create(
    @Param('trainingId') trainingId: string,
    @Body() createMaterialDto: CreateMaterialDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.materialsService.create(trainingId, createMaterialDto, file, req.user?.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all materials for a training' })
  findAll(@Param('trainingId') trainingId: string) {
    return this.materialsService.findAll(trainingId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Delete material (Admin/Trainer only)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.materialsService.remove(id, req.user.userId, req.user.role);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get material versions' })
  getVersions(@Param('id') id: string) {
    return this.materialVersionsService.getVersions(id);
  }
}

