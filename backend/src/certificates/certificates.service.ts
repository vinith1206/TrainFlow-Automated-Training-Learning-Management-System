import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AutomationService } from '../automation/automation.service';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CertificatesService {
  constructor(
    private prisma: PrismaService,
    private automationService: AutomationService,
  ) {}

  async generateCertificate(trainingId: string, userId: string) {
    // Check eligibility
    const isEligible = await this.automationService.checkCertificateEligibility(
      trainingId,
      userId,
    );

    if (!isEligible) {
      throw new Error('Not eligible for certificate. Attendance must be >= 75%');
    }

    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        trainer: true,
        enrollments: {
          where: { userId },
          include: { user: true },
        },
      },
    });

    if (!training || training.enrollments.length === 0) {
      throw new Error('Training or enrollment not found');
    }

    const user = training.enrollments[0].user;
    const certificateId = `${trainingId}-${userId}-${Date.now()}`;

    // Generate QR code
    const qrCodeData = JSON.stringify({
      certificateId,
      trainingId,
      userId,
      trainingName: training.name,
      participantName: `${user.firstName} ${user.lastName}`,
      issuedDate: new Date().toISOString(),
    });

    // Generate QR code (in production, embed in PDF)
    // const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    // Generate PDF certificate
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([800, 600]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Title
    page.drawText('CERTIFICATE OF COMPLETION', {
      x: 200,
      y: 500,
      size: 32,
      font: boldFont,
      color: rgb(0, 0, 0.5),
    });

    // Subtitle
    page.drawText('This is to certify that', {
      x: 300,
      y: 450,
      size: 16,
      font: font,
    });

    // Participant name
    page.drawText(`${user.firstName} ${user.lastName}`, {
      x: 250,
      y: 400,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    });

    // Training details
    page.drawText(`has successfully completed`, {
      x: 280,
      y: 350,
      size: 16,
      font: font,
    });

    page.drawText(training.name, {
      x: 200,
      y: 300,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0.6),
    });

    page.drawText(`Date: ${new Date(training.endDate).toLocaleDateString()}`, {
      x: 300,
      y: 250,
      size: 14,
      font: font,
    });

    // Trainer signature
    page.drawText(`Trainer: ${training.trainer.firstName} ${training.trainer.lastName}`, {
      x: 300,
      y: 200,
      size: 12,
      font: font,
    });

    // QR Code (simplified - in production, embed actual image)
    page.drawText('Certificate ID:', {
      x: 50,
      y: 100,
      size: 10,
      font: font,
    });
    page.drawText(certificateId.substring(0, 30), {
      x: 50,
      y: 85,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Save certificate
    const pdfBytes = await pdfDoc.save();
    const fileName = `certificate-${certificateId}.pdf`;
    const filePath = path.join(process.env.UPLOAD_DEST || './uploads', fileName);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    fs.writeFileSync(filePath, pdfBytes);

    return {
      certificateId,
      filePath: `/uploads/${fileName}`,
      fileName,
      qrCodeData,
    };
  }

  async verifyCertificate(certificateId: string) {
    // In production, store certificate data in database
    // For now, parse from certificateId
    const parts = certificateId.split('-');
    if (parts.length < 3) {
      return { valid: false, message: 'Invalid certificate ID' };
    }

    const trainingId = parts[0];
    const userId = parts[1];

    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        enrollments: {
          where: { userId },
          include: { user: true },
        },
      },
    });

    if (!training || training.enrollments.length === 0) {
      return { valid: false, message: 'Certificate not found' };
    }

    return {
      valid: true,
      training: {
        name: training.name,
        endDate: training.endDate,
      },
      participant: {
        name: `${training.enrollments[0].user.firstName} ${training.enrollments[0].user.lastName}`,
      },
    };
  }
}

