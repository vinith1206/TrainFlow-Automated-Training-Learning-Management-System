import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Certificates')
@Controller('certificates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('generate/:trainingId')
  @ApiOperation({ summary: 'Generate certificate for completed training' })
  async generateCertificate(
    @Param('trainingId') trainingId: string,
    @Request() req,
  ) {
    return this.certificatesService.generateCertificate(trainingId, req.user.userId);
  }

  @Get('verify/:certificateId')
  @ApiOperation({ summary: 'Verify certificate by ID' })
  async verifyCertificate(@Param('certificateId') certificateId: string) {
    return this.certificatesService.verifyCertificate(certificateId);
  }
}

