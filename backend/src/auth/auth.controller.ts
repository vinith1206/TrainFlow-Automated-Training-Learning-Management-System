import { Controller, Post, Body, UseGuards, Get, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user (may require 2FA)' })
  async login(@Body() loginDto: LoginDto & { twoFactorToken?: string }) {
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/vineeth/Downloads/downloads/vineeth/deloitte/.cursor/debug.log';
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'auth.controller.ts:login-entry',message:'Login endpoint called',data:{email:loginDto.email,hasPassword:!!loginDto.password,has2FAToken:!!loginDto.twoFactorToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
    } catch(e) {}
    // #endregion
    const result = await this.authService.login(loginDto);
    // #region agent log
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'auth.controller.ts:login-exit',message:'Login endpoint returning',data:{hasAccessToken:!!result.access_token,hasUser:!!result.user,requires2FA:!!result.requires2FA},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
    } catch(e) {}
    // #endregion
    return result;
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getProfile(@Request() req) {
    return this.authService.validateToken(req.user.userId);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(
    @Query('token') token: string,
    @Query('email') email: string,
    @Body() body: { newPassword: string },
  ) {
    return this.authService.resetPasswordWithEmail(email, token, body.newPassword);
  }
}

