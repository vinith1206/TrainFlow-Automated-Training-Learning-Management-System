import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  /**
   * Summarize feedback comments into key insights
   * In production, this would use OpenAI/Claude API
   */
  async summarizeFeedback(trainingId: string): Promise<{
    summary: string;
    keyThemes: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    effectivenessScore: number;
    recommendations: string[];
  }> {
    const feedbacks = await this.prisma.feedback.findMany({
      where: { trainingId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (feedbacks.length === 0) {
      return {
        summary: 'No feedback available yet.',
        keyThemes: [],
        sentiment: 'neutral',
        effectivenessScore: 0,
        recommendations: [],
      };
    }

    // Extract comments
    const comments = feedbacks
      .filter((f) => f.comment)
      .map((f) => f.comment)
      .join(' ');

    // Calculate average rating
    const avgRating =
      feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;

    // Simple keyword extraction (in production, use NLP/AI)
    const positiveKeywords = ['great', 'excellent', 'good', 'helpful', 'useful', 'amazing', 'wonderful'];
    const negativeKeywords = ['poor', 'bad', 'disappointing', 'confusing', 'waste', 'boring'];
    
    const lowerComments = comments.toLowerCase();
    const positiveCount = positiveKeywords.filter((kw) => lowerComments.includes(kw)).length;
    const negativeCount = negativeKeywords.filter((kw) => lowerComments.includes(kw)).length;

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';

    // Extract key themes (simplified - in production use AI)
    const themes = this.extractThemes(comments);

    // Calculate effectiveness score (0-100)
    const attendanceRate = await this.getAttendanceRate(trainingId);
    const completionRate = await this.getCompletionRate(trainingId);
    const effectivenessScore = Math.round(
      (avgRating / 5) * 40 + (attendanceRate / 100) * 30 + (completionRate / 100) * 30
    );

    // Generate summary
    const summary = this.generateSummary(feedbacks, avgRating, sentiment);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      avgRating,
      attendanceRate,
      completionRate,
      sentiment
    );

    return {
      summary,
      keyThemes: themes,
      sentiment,
      effectivenessScore,
      recommendations,
    };
  }

  /**
   * Calculate training effectiveness score
   */
  async calculateEffectivenessScore(trainingId: string): Promise<number> {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        feedbacks: true,
        enrollments: true,
        attendance: true,
      },
    });

    if (!training) return 0;

    const avgRating =
      training.feedbacks.length > 0
        ? training.feedbacks.reduce((sum, f) => sum + f.rating, 0) / training.feedbacks.length
        : 0;

    const attendanceRate =
      training.enrollments.length > 0
        ? (training.attendance.filter((a) => a.status === 'PRESENT').length /
            training.enrollments.length) *
          100
        : 0;

    const completionRate =
      training.enrollments.length > 0
        ? (training.enrollments.filter((e) => e.status === 'COMPLETED').length /
            training.enrollments.length) *
          100
        : 0;

    // Weighted score: Rating (40%), Attendance (30%), Completion (30%)
    return Math.round(
      (avgRating / 5) * 40 + (attendanceRate / 100) * 30 + (completionRate / 100) * 30
    );
  }

  /**
   * Get AI-based recommendations for trainer improvement
   */
  async getTrainerRecommendations(trainerId: string): Promise<string[]> {
    const trainings = await this.prisma.training.findMany({
      where: { trainerId },
      include: {
        feedbacks: true,
        attendance: true,
        enrollments: true,
      },
    });

    if (trainings.length === 0) {
      return ['No training data available for recommendations.'];
    }

    const recommendations: string[] = [];

    // Analyze average ratings
    const allRatings = trainings.flatMap((t) => t.feedbacks.map((f) => f.rating));
    const avgRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : 0;

    if (avgRating < 3.5) {
      recommendations.push('Consider improving training delivery based on feedback');
    }

    // Analyze attendance
    const avgAttendance = trainings.map((t) => {
      if (t.enrollments.length === 0) return 0;
      return (t.attendance.filter((a) => a.status === 'PRESENT').length / t.enrollments.length) * 100;
    });
    const overallAttendance = avgAttendance.reduce((sum, a) => sum + a, 0) / avgAttendance.length;

    if (overallAttendance < 75) {
      recommendations.push('Attendance rates are below 75%. Consider improving engagement strategies.');
    }

    // Analyze completion
    const completionRates = trainings.map((t) => {
      if (t.enrollments.length === 0) return 0;
      return (t.enrollments.filter((e) => e.status === 'COMPLETED').length / t.enrollments.length) * 100;
    });
    const overallCompletion = completionRates.reduce((sum, c) => sum + c, 0) / completionRates.length;

    if (overallCompletion < 80) {
      recommendations.push('Completion rates could be improved. Consider follow-up strategies.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great performance! Keep up the excellent work.');
    }

    return recommendations;
  }

  private extractThemes(comments: string): string[] {
    // Simplified theme extraction (in production, use AI/NLP)
    const commonThemes = [
      'content quality',
      'trainer expertise',
      'practical examples',
      'time management',
      'interactive sessions',
      'material clarity',
    ];

    const lowerComments = comments.toLowerCase();
    return commonThemes.filter((theme) =>
      lowerComments.includes(theme.split(' ')[0])
    );
  }

  private generateSummary(
    feedbacks: any[],
    avgRating: number,
    sentiment: string
  ): string {
    const total = feedbacks.length;
    const withComments = feedbacks.filter((f) => f.comment).length;

    return `Received ${total} feedback responses with an average rating of ${avgRating.toFixed(1)}/5. ${withComments} participants provided detailed comments. Overall sentiment is ${sentiment}.`;
  }

  private generateRecommendations(
    avgRating: number,
    attendanceRate: number,
    completionRate: number,
    sentiment: string
  ): string[] {
    const recommendations: string[] = [];

    if (avgRating < 3) {
      recommendations.push('Consider revising training content and delivery methods');
    }
    if (attendanceRate < 75) {
      recommendations.push('Improve engagement to increase attendance rates');
    }
    if (completionRate < 80) {
      recommendations.push('Implement follow-up strategies to improve completion rates');
    }
    if (sentiment === 'negative') {
      recommendations.push('Address negative feedback themes in future sessions');
    }
    if (recommendations.length === 0) {
      recommendations.push('Training is performing well. Continue current approach.');
    }

    return recommendations;
  }

  private async getAttendanceRate(trainingId: string): Promise<number> {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        enrollments: true,
        attendance: true,
      },
    });

    if (!training || training.enrollments.length === 0) return 0;

    const presentCount = training.attendance.filter((a) => a.status === 'PRESENT').length;
    return (presentCount / training.enrollments.length) * 100;
  }

  private async getCompletionRate(trainingId: string): Promise<number> {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        enrollments: true,
      },
    });

    if (!training || training.enrollments.length === 0) return 0;

    const completedCount = training.enrollments.filter((e) => e.status === 'COMPLETED').length;
    return (completedCount / training.enrollments.length) * 100;
  }
}

