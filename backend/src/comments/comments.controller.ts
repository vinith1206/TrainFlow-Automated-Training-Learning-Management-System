import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService, CreateCommentDto } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Comments')
@Controller('comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create comment' })
  async create(@Request() req, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(req.user.userId, dto);
  }

  @Get('training/:trainingId')
  @ApiOperation({ summary: 'Get comments for training' })
  async findByTraining(@Param('trainingId') trainingId: string) {
    return this.commentsService.findByTraining(trainingId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update comment' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { content: string },
  ) {
    return this.commentsService.update(id, req.user.userId, body.content);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete comment' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.commentsService.delete(id, req.user.userId, req.user.role);
  }
}

