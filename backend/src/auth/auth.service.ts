import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { TwoFactorService } from './two-factor/two-factor.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private twoFactorService: TwoFactorService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/vineeth/Downloads/downloads/vineeth/deloitte/.cursor/debug.log';
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'auth.service.ts:validateUser-entry',message:'validateUser called',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
    } catch(e) {}
    // #endregion
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    // #region agent log
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'auth.service.ts:validateUser-after-query',message:'User query result',data:{userFound:!!user,userId:user?.id,isActive:user?.isActive},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
    } catch(e) {}
    // #endregion

    if (user && (await bcrypt.compare(password, user.password))) {
      // #region agent log
      try {
        fs.appendFileSync(logPath, JSON.stringify({location:'auth.service.ts:validateUser-password-match',message:'Password matches',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
      } catch(e) {}
      // #endregion
      const { password: _, ...result } = user;
      return result;
    }
    // #region agent log
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'auth.service.ts:validateUser-password-mismatch',message:'Password mismatch or user not found',data:{userFound:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
    } catch(e) {}
    // #endregion
    return null;
  }

  async login(loginDto: LoginDto & { twoFactorToken?: string }) {
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/vineeth/Downloads/downloads/vineeth/deloitte/.cursor/debug.log';
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'auth.service.ts:login-entry',message:'Login service method called',data:{email:loginDto.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
    } catch(e) {}
    // #endregion
    const user = await this.validateUser(loginDto.email, loginDto.password);
    // #region agent log
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'auth.service.ts:login-after-validate',message:'After validateUser',data:{userFound:!!user,userId:user?.id,isActive:user?.isActive},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
    } catch(e) {}
    // #endregion
    if (!user) {
      // #region agent log
      try {
        fs.appendFileSync(logPath, JSON.stringify({location:'auth.service.ts:login-no-user',message:'User not found, throwing error',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
      } catch(e) {}
      // #endregion
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      // #region agent log
      try {
        fs.appendFileSync(logPath, JSON.stringify({location:'auth.service.ts:login-inactive',message:'User inactive, throwing error',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
      } catch(e) {}
      // #endregion
      throw new UnauthorizedException('Account is inactive');
    }

    // Check if 2FA is enabled (only if explicitly enabled)
    if (user.twoFactorEnabled === true && user.twoFactorSecret) {
      // If 2FA token is provided, verify it
      if (loginDto.twoFactorToken) {
        const isValid = await this.twoFactorService.verify2FA(user.id, loginDto.twoFactorToken);
        if (!isValid) {
          throw new UnauthorizedException('Invalid 2FA token');
        }
      } else {
        // Return a flag indicating 2FA is required
        return {
          requires2FA: true,
          userId: user.id,
          message: 'Two-factor authentication required',
        };
      }
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    const result = {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled || false,
      },
    };
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/vineeth/Downloads/downloads/vineeth/deloitte/.cursor/debug.log';
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'auth.service.ts:login-success',message:'Login successful, returning token',data:{userId:user.id,role:user.role,tokenLength:token.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
    } catch(e) {}
    // #endregion
    return result;
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: registerDto.role || 'PARTICIPANT',
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async validateToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid or inactive user');
    }

    return user;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token (in production, use a separate PasswordResetToken table)
    // For MVP, we'll use a simple approach - store token in a way that works
    // In production, create: model PasswordResetToken { id, userId, token, expiresAt }
    
    // For now, we'll generate a token and send email
    // The token will be validated via email link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // Send reset email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      resetLink,
    );

    // In production, store token in database with expiry
    // For MVP, we'll accept any token for the email (not secure - implement properly in production)
    // TODO: Create PasswordResetToken table for production

    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  async resetPasswordWithEmail(email: string, token: string, newPassword: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In production, verify token from database
    // For MVP, we'll accept any token (not secure - implement properly in production)
    // TODO: Verify token from PasswordResetToken table and check expiry

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: 'Password reset successfully' };
  }
}
