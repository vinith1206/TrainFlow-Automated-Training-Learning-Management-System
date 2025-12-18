import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrainingTemplatesService, CreateTemplateDto } from './training-templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Training Templates')
@Controller('training-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrainingTemplatesController {
  constructor(private readonly templatesService: TrainingTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create training template' })
  async create(@Request() req, @Body() dto: CreateTemplateDto) {
    return this.templatesService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates' })
  async findAll(
    @Query('category') category?: string,
    @Query('isPublic') isPublic?: string,
    @Query('search') search?: string,
  ) {
    return this.templatesService.findAll({
      category,
      isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  async findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Post(':id/create-training')
  @ApiOperation({ summary: 'Create training from template' })
  async createFromTemplate(
    @Param('id') id: string,
    @Request() req,
    @Body() overrides?: any,
  ) {
    return this.templatesService.createTrainingFromTemplate(id, req.user.userId, overrides);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update template' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: Partial<CreateTemplateDto>,
  ) {
    return this.templatesService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete template' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.templatesService.delete(id, req.user.userId);
  }
}

