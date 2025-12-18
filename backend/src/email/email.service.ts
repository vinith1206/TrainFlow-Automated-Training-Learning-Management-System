import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: parseInt(this.configService.get('SMTP_PORT') || '587'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEnrollmentConfirmation(email: string, firstName: string, trainingName: string, startDate: Date) {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to: email,
      subject: `Enrollment Confirmed: ${trainingName}`,
      html: `
        <h2>Welcome to ${trainingName}!</h2>
        <p>Hi ${firstName},</p>
        <p>Your enrollment has been confirmed. The training will start on ${new Date(startDate).toLocaleDateString()}.</p>
        <p>We'll send you pre-work materials shortly.</p>
        <p>Best regards,<br>TMDS Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email send error:', error);
    }
  }

  async sendMaterialNotification(email: string, firstName: string, trainingName: string, materialName: string, link: string) {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to: email,
      subject: `New Material Available: ${materialName}`,
      html: `
        <h2>New Material Available</h2>
        <p>Hi ${firstName},</p>
        <p>A new material "${materialName}" is now available for ${trainingName}.</p>
        <p><a href="${link}">Access Material</a></p>
        <p>Best regards,<br>TMDS Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email send error:', error);
    }
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetLink: string) {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@tmds.com',
      to: email,
      subject: 'Password Reset Request - TMDS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${firstName},</p>
          <p>You requested to reset your password for your TMDS account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetLink}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      // Don't throw - email failure shouldn't break the flow
    }
  }

  async sendFeedbackReminder(email: string, firstName: string, trainingName: string) {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to: email,
      subject: `Feedback Request: ${trainingName}`,
      html: `
        <h2>We'd Love Your Feedback</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for attending ${trainingName}. We'd appreciate your feedback to help us improve.</p>
        <p><a href="${this.configService.get('FRONTEND_URL')}/trainings">Submit Feedback</a></p>
        <p>Best regards,<br>TMDS Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email send error:', error);
    }
  }
}

