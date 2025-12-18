import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from '../reports/reports.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ScheduledReportsService {
  constructor(
    private prisma: PrismaService,
    private reportsService: ReportsService,
    private emailService: EmailService,
  ) {}

  /**
   * Generate and email weekly reports to admins
   */
  @Cron(CronExpression.EVERY_WEEK)
  async generateWeeklyReports() {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
    });

    const trainings = await this.prisma.training.findMany({
      where: {
        status: 'COMPLETED',
        endDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    for (const training of trainings) {
      try {
        // Generate reports
        const attendanceReport = await this.reportsService.generateAttendanceReport(training.id);
        const completionReport = await this.reportsService.generateCompletionReport(training.id);
        const feedbackReport = await this.reportsService.generateFeedbackReport(training.id);

        // Email to admins
        for (const admin of admins) {
          // In production, attach files to email
          // For now, just notify
          console.log(`Weekly reports generated for training ${training.name}`);
        }
      } catch (error) {
        console.error(`Error generating reports for training ${training.id}:`, error);
      }
    }
  }

  /**
   * Generate monthly summary report
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateMonthlySummary() {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const trainings = await this.prisma.training.findMany({
      where: {
        endDate: {
          gte: startOfMonth,
        },
      },
      include: {
        enrollments: true,
        feedbacks: true,
        attendance: true,
      },
    });

    const summary = {
      totalTrainings: trainings.length,
      totalParticipants: trainings.reduce((sum, t) => sum + t.enrollments.length, 0),
      totalCompleted: trainings.filter((t) => t.status === 'COMPLETED').length,
      avgRating: trainings.length > 0
        ? trainings.reduce((sum, t) => {
            const avg = t.feedbacks.length > 0
              ? t.feedbacks.reduce((s, f) => s + f.rating, 0) / t.feedbacks.length
              : 0;
            return sum + avg;
          }, 0) / trainings.length
        : 0,
    };

    // In production, generate Excel report and email
    console.log('Monthly Summary:', summary);
  }
}

