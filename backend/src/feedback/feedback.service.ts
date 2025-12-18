import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(trainingId: string, userId: string, createFeedbackDto: CreateFeedbackDto) {
    // Check if enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        trainingId_userId: {
          trainingId,
          userId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('You are not enrolled in this training');
    }

    // Check if already submitted
    const existing = await this.prisma.feedback.findUnique({
      where: {
        trainingId_userId: {
          trainingId,
          userId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Feedback already submitted');
    }

    return this.prisma.feedback.create({
      data: {
        trainingId,
        userId,
        rating: createFeedbackDto.rating,
        comment: createFeedbackDto.comment,
        trainerRating: createFeedbackDto.trainerRating,
        trainerComment: createFeedbackDto.trainerComment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(trainingId: string) {
    return this.prisma.feedback.findMany({
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
        submittedAt: 'desc',
      },
    });
  }

  async getAnalytics(trainingId: string) {
    const feedbacks = await this.findAll(trainingId);

    if (feedbacks.length === 0) {
      return {
        total: 0,
        avgRating: 0,
        avgTrainerRating: 0,
        ratingDistribution: {},
        commonThemes: [],
      };
    }

    const avgRating =
      feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;

    const trainerRatings = feedbacks.filter((f) => f.trainerRating).map((f) => f.trainerRating);
    const avgTrainerRating =
      trainerRatings.length > 0
        ? trainerRatings.reduce((sum, r) => sum + r, 0) / trainerRatings.length
        : 0;

    const ratingDistribution = {
      5: feedbacks.filter((f) => f.rating === 5).length,
      4: feedbacks.filter((f) => f.rating === 4).length,
      3: feedbacks.filter((f) => f.rating === 3).length,
      2: feedbacks.filter((f) => f.rating === 2).length,
      1: feedbacks.filter((f) => f.rating === 1).length,
    };

    return {
      total: feedbacks.length,
      avgRating: Math.round(avgRating * 10) / 10,
      avgTrainerRating: Math.round(avgTrainerRating * 10) / 10,
      ratingDistribution,
      feedbacks,
    };
  }
}

