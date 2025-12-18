import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async markAttendance(trainingId: string, markAttendanceDto: MarkAttendanceDto, markedBy?: string) {
    const { userId, status, notes } = markAttendanceDto;

    // Check if enrollment exists
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        trainingId_userId: {
          trainingId,
          userId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('User is not enrolled in this training');
    }

    const attendance = await this.prisma.attendance.upsert({
      where: {
        trainingId_userId: {
          trainingId,
          userId,
        },
      },
      create: {
        trainingId,
        userId,
        status: status || AttendanceStatus.PRESENT,
        checkInTime: new Date(),
        markedBy,
        notes,
      },
      update: {
        status: status || AttendanceStatus.PRESENT,
        checkInTime: new Date(),
        markedBy,
        notes,
      },
    });

    return attendance;
  }

  async selfCheckIn(trainingId: string, userId: string) {
    return this.markAttendance(
      trainingId,
      {
        userId,
        status: AttendanceStatus.PRESENT,
      },
      userId,
    );
  }

  async findAll(trainingId: string) {
    const attendance = await this.prisma.attendance.findMany({
      where: { trainingId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        checkInTime: 'desc',
      },
    });

    const totalEnrollments = await this.prisma.enrollment.count({
      where: { trainingId },
    });

    const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
    const attendanceRate = totalEnrollments > 0 ? (presentCount / totalEnrollments) * 100 : 0;

    return {
      records: attendance,
      stats: {
        total: attendance.length,
        present: presentCount,
        absent: attendance.filter((a) => a.status === 'ABSENT').length,
        late: attendance.filter((a) => a.status === 'LATE').length,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
      },
    };
  }

  async getAttendanceRate(trainingId: string) {
    const totalEnrollments = await this.prisma.enrollment.count({
      where: { trainingId },
    });

    const presentCount = await this.prisma.attendance.count({
      where: {
        trainingId,
        status: AttendanceStatus.PRESENT,
      },
    });

    return totalEnrollments > 0 ? (presentCount / totalEnrollments) * 100 : 0;
  }
}

