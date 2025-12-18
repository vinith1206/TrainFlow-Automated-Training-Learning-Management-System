import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateAttendanceReport(trainingId: string) {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        enrollments: {
          include: {
            user: true,
          },
        },
        attendance: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    // Headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Check-in Time', key: 'checkInTime', width: 20 },
      { header: 'Notes', key: 'notes', width: 40 },
    ];

    // Add training info
    worksheet.addRow({ name: 'Training:', email: training.name });
    worksheet.addRow({ name: 'Date:', email: training.startDate.toISOString() });
    worksheet.addRow([]);

    // Add data
    training.enrollments.forEach((enrollment) => {
      const attendance = training.attendance.find((a) => a.userId === enrollment.userId);
      worksheet.addRow({
        name: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
        email: enrollment.user.email,
        status: attendance?.status || 'ABSENT',
        checkInTime: attendance?.checkInTime?.toISOString() || '',
        notes: attendance?.notes || '',
      });
    });

    // Ensure uploads directory exists
    const uploadDir = process.env.UPLOAD_DEST || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    const fileName = `attendance-${trainingId}-${Date.now()}.xlsx`;
    const filePath = path.join(uploadDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    // Save report record
    const report = await this.prisma.report.create({
      data: {
        trainingId,
        type: 'ATTENDANCE',
        fileUrl: `/uploads/${fileName}`,
        fileName,
      },
    });

    return {
      report,
      fileName,
      filePath: path.resolve(filePath),
    };
  }

  async generateCompletionReport(trainingId: string) {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        enrollments: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Completion Report');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Enrolled At', key: 'enrolledAt', width: 20 },
      { header: 'Completed At', key: 'completedAt', width: 20 },
    ];

    worksheet.addRow({ name: 'Training:', email: training.name });
    worksheet.addRow([]);

    training.enrollments.forEach((enrollment) => {
      worksheet.addRow({
        name: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
        email: enrollment.user.email,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        completedAt: enrollment.completedAt?.toISOString() || '',
      });
    });

    // Ensure uploads directory exists
    const uploadDir = process.env.UPLOAD_DEST || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `completion-${trainingId}-${Date.now()}.xlsx`;
    const filePath = path.join(uploadDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    const report = await this.prisma.report.create({
      data: {
        trainingId,
        type: 'COMPLETION',
        fileUrl: `/uploads/${fileName}`,
        fileName,
      },
    });

    return {
      report,
      fileName,
      filePath: path.resolve(filePath),
    };
  }

  async generateFeedbackReport(trainingId: string) {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        feedbacks: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Feedback Report');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Comment', key: 'comment', width: 50 },
      { header: 'Trainer Rating', key: 'trainerRating', width: 15 },
      { header: 'Trainer Comment', key: 'trainerComment', width: 50 },
      { header: 'Submitted At', key: 'submittedAt', width: 20 },
    ];

    worksheet.addRow({ name: 'Training:', email: training.name });
    worksheet.addRow([]);

    training.feedbacks.forEach((feedback) => {
      worksheet.addRow({
        name: `${feedback.user.firstName} ${feedback.user.lastName}`,
        email: feedback.user.email,
        rating: feedback.rating,
        comment: feedback.comment || '',
        trainerRating: feedback.trainerRating || '',
        trainerComment: feedback.trainerComment || '',
        submittedAt: feedback.submittedAt.toISOString(),
      });
    });

    // Ensure uploads directory exists
    const uploadDir = process.env.UPLOAD_DEST || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `feedback-${trainingId}-${Date.now()}.xlsx`;
    const filePath = path.join(uploadDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    const report = await this.prisma.report.create({
      data: {
        trainingId,
        type: 'FEEDBACK',
        fileUrl: `/uploads/${fileName}`,
        fileName,
      },
    });

    return {
      report,
      fileName,
      filePath: path.resolve(filePath),
    };
  }
}

