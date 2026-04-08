// src/review-management/review.service.ts

import { BadGatewayException, BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from 'src/dto/rm.dto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

@Injectable()
export class ReviewService {
  private readonly logger: Logger;
  constructor(private readonly prismaService: PrismaService) {
    this.logger = new Logger(ReviewService.name);
  }
 
  async createReview(
    createReviewDto: CreateReviewDto,
    requestingUserId: string,
  ): Promise<UniversalResponseDTO> {
    if (!createReviewDto) {
      throw new BadRequestException({ success: false, message: 'Review data is required' });
    }
 
    // Product existence check is outside try/catch so NotFoundException propagates correctly
    const product = await this.prismaService.product.findUnique({
      where: { id: createReviewDto.productId },
    });
 
    if (!product) {
      throw new NotFoundException({ success: false, message: 'Product not found' });
    }
 
    try {
      const review = await this.prismaService.review.create({
        data: {
          rating: createReviewDto.rating,
          comment: createReviewDto.comment,
          productId: createReviewDto.productId,
          userId: requestingUserId,  // A01 — bind to authenticated user
        },
      });
      return { success: true, message: 'Review submitted successfully', data: review };
    } catch (error) {
      this.logger.error('Review create failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
 
  async getReviewsByProduct(productId: string): Promise<UniversalResponseDTO> {
    if (!productId) {
      throw new BadRequestException({ success: false, message: 'Product ID is required' });
    }
 
    const product = await this.prismaService.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException({ success: false, message: 'Product not found' });
    }
 
    // BUG FIX — NotFoundException was previously thrown inside the catch block,
    // causing it to be swallowed and re-thrown as a misleading 502 BadGatewayException.
    const reviews = await this.prismaService.review.findMany({ where: { productId } });
 
    if (!reviews.length) {
      throw new NotFoundException({ success: false, message: 'No reviews found for this product' });
    }
 
    return { success: true, message: 'Reviews retrieved successfully', data: reviews };
  }
 
  async deleteReview(reviewId: string, requestingUserId: string): Promise<UniversalResponseDTO> {
    if (!reviewId) {
      throw new BadRequestException({ success: false, message: 'Review ID is required' });
    }
 
    const review = await this.prismaService.review.findUnique({ where: { id: reviewId } });
 
    if (!review) {
      throw new NotFoundException({ success: false, message: 'Review not found' });
    }
 
    // A01 — only the author can delete their own review
    if (review.userId !== requestingUserId) {
      // logSecurityEvent('REVIEW_DELETE_UNAUTHORIZED', { requestingUserId, reviewId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    try {
      await this.prismaService.review.delete({ where: { id: reviewId } });
      return { success: true, message: 'Review deleted successfully' };
    } catch (error) {
      this.logger.error('Review delete failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
}
