import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AutomationService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

  /**
   * Check for incomplete pre-work daily
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkIncompletePreWork() {
    const trainings = await this.prisma.training.findMany({
      where: {
        status: 'SCHEDULED',
        startDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
      include: {
        enrollments: {
          include: { user: true },
        },
        materials: {
          where: { type: 'PRE_WORK' },
        },
      },
    });

    for (const training of trainings) {
      for (const enrollment of training.enrollments) {
        if (!enrollment.preWorkCompleted && training.materials.length > 0) {
          // Send reminder
          await this.notificationsService.create({
            userId: enrollment.userId,
            title: 'Pre-work Reminder',
            message: `Complete pre-work materials for ${training.name} before the training starts.`,
            type: 'WARNING',
            link: `/trainings/${training.id}/materials`,
          });

          await this.emailService.sendFeedbackReminder(
            enrollment.user.email,
            enrollment.user.firstName,
            training.name,
          );
        }
      }
    }
  }

  /**
   * Check for missed attendance
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async checkMissedAttendance() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const trainings = await this.prisma.training.findMany({
      where: {
        status: 'IN_PROGRESS',
        startDate: {
          lte: today,
        },
      },
      include: {
        enrollments: {
          include: { user: true },
        },
        attendance: true,
      },
    });

    for (const training of trainings) {
      for (const enrollment of training.enrollments) {
        const hasAttendance = training.attendance.some(
          (a) => a.userId === enrollment.userId,
        );

        if (!hasAttendance) {
          await this.notificationsService.create({
            userId: enrollment.userId,
            title: 'Attendance Reminder',
            message: `Don't forget to check in for ${training.name}.`,
            type: 'WARNING',
            link: `/trainings/${training.id}/attendance`,
          });
        }
      }
    }
  }

  /**
   * Check for pending feedback
   */
  @Cron(CronExpression.EVERY_DAY_AT_2PM)
  async checkPendingFeedback() {
    const trainings = await this.prisma.training.findMany({
      where: {
        status: 'COMPLETED',
        endDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        enrollments: {
          include: { user: true },
        },
        feedbacks: true,
      },
    });

    for (const training of trainings) {
      for (const enrollment of training.enrollments) {
        const hasFeedback = training.feedbacks.some(
          (f) => f.userId === enrollment.userId,
        );

        if (!hasFeedback && enrollment.status === 'COMPLETED') {
          await this.notificationsService.create({
            userId: enrollment.userId,
            title: 'Feedback Reminder',
            message: `Please provide feedback for ${training.name}.`,
            type: 'INFO',
            link: `/trainings/${training.id}/feedback`,
          });

          await this.emailService.sendFeedbackReminder(
            enrollment.user.email,
            enrollment.user.firstName,
            training.name,
          );
        }
      }
    }
  }

  /**
   * Auto-check certificate eligibility
   */
  async checkCertificateEligibility(trainingId: string, userId: string): Promise<boolean> {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        enrollments: {
          where: { userId },
        },
        attendance: {
          where: { userId },
        },
      },
    });

    if (!training || training.status !== 'COMPLETED') {
      return false;
    }

    const enrollment = training.enrollments[0];
    if (!enrollment || enrollment.status !== 'COMPLETED') {
      return false;
    }

    // Check attendance rate (must be >= 75%)
    const totalEnrollments = await this.prisma.enrollment.count({
      where: { trainingId },
    });

    const presentCount = training.attendance.filter((a) => a.status === 'PRESENT').length;
    const attendanceRate = totalEnrollments > 0 ? (presentCount / totalEnrollments) * 100 : 0;

    return attendanceRate >= 75;
  }

  /**
   * Send training reschedule notifications
   */
  async notifyTrainingReschedule(trainingId: string, oldDate: Date, newDate: Date) {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        enrollments: {
          include: { user: true },
        },
      },
    });

    if (!training) return;

    for (const enrollment of training.enrollments) {
      await this.notificationsService.create({
        userId: enrollment.userId,
        title: 'Training Rescheduled',
        message: `${training.name} has been rescheduled from ${oldDate.toLocaleDateString()} to ${newDate.toLocaleDateString()}.`,
        type: 'WARNING',
        link: `/trainings/${trainingId}`,
      });
    }
  }
}

