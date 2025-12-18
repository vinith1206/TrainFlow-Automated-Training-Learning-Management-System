import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorService {
  constructor(private prisma: PrismaService) {}

  async generateSecret(userId: string, email: string) {
    const secret = speakeasy.generateSecret({
      name: `TrainFlow (${email})`,
      issuer: 'TrainFlow',
    });

    // Store temporary secret (in production, store in database with expiry)
    const tempSecret = secret.base32;

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: tempSecret,
      qrCodeUrl,
      manualEntryKey: secret.base32,
    };
  }

  async verifyToken(secret: string, token: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after
    });
  }

  async enable2FA(userId: string, secret: string, token: string) {
    // Verify the token first
    const isValid = await this.verifyToken(secret, token);
    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Update user with 2FA secret
    // Note: In production, encrypt the secret before storing
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret, // In production, encrypt this
        twoFactorEnabled: true,
      },
    });

    return { message: '2FA enabled successfully' };
  }

  async disable2FA(userId: string, password: string) {
    // Verify password first
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // In production, verify password here using bcrypt
    // For now, we'll just disable 2FA

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
      },
    });

    return { message: '2FA disabled successfully' };
  }

  async verify2FA(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA not enabled for this user');
    }

    // Get user's 2FA secret (from database)
    const secret = user.twoFactorSecret;
    return this.verifyToken(secret, token);
  }
}

