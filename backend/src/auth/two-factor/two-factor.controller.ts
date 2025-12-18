import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorService } from './two-factor.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Two-Factor Authentication')
@Controller('auth/2fa')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Get('setup')
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  async setup(@Request() req) {
    const user = req.user;
    return this.twoFactorService.generateSecret(user.userId, user.email);
  }

  @Post('enable')
  @ApiOperation({ summary: 'Enable 2FA for user' })
  async enable(@Request() req, @Body() body: { secret: string; token: string }) {
    return this.twoFactorService.enable2FA(req.user.userId, body.secret, body.token);
  }

  @Post('disable')
  @ApiOperation({ summary: 'Disable 2FA for user' })
  async disable(@Request() req, @Body() body: { password: string }) {
    return this.twoFactorService.disable2FA(req.user.userId, body.password);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify 2FA token' })
  async verify(@Request() req, @Body() body: { token: string }) {
    const isValid = await this.twoFactorService.verify2FA(req.user.userId, body.token);
    if (!isValid) {
      throw new Error('Invalid 2FA token');
    }
    return { verified: true };
  }
}

