// src/review-management/review.controller.ts

import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ReviewService } from './rm.service';
import { CreateReviewDto } from 'src/dto/rm.dto';


@Controller('products')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':productId/reviews')
  async createReview(
    @Param('productId') productId: string,
    @Body('data') createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.createReview({ ...createReviewDto, productId });
  }

  @Get(':productId/reviews')
  async getReviewsByProduct(@Param('productId') productId: string) {
    return this.reviewService.getReviewsByProduct(productId);
  }

  @Delete('reviews/:reviewId')
  async deleteReview(@Param('reviewId') reviewId: string) {
    return this.reviewService.deleteReview(reviewId);
  }
}
