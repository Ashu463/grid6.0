// src/review-management/review.controller.ts

import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { ReviewService } from './rm.service';
import { CreateReviewDto } from 'src/dto/rm.dto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

@ApiTags('Reviews Management')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':productId')
  @ApiOperation({ summary: 'Create a new review for a product' })
  @ApiParam({ name: 'productId', description: 'ID of the product' })
  @ApiBody({ type: CreateReviewDto, description: 'Review data' })
  @ApiResponse({ status: 201, description: 'The review has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input, object invalid.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async createReview(
    @Param('productId') productId: string,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<UniversalResponseDTO> {
    return this.reviewService.createReview({ ...createReviewDto, productId });
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get all reviews for a product' })
  @ApiParam({ name: 'productId', description: 'ID of the product' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No reviews found for this product.' })
  async getReviewsByProduct(@Param('productId') productId: string): Promise<UniversalResponseDTO> {
    return this.reviewService.getReviewsByProduct(productId);
  }

  @Delete(':reviewId')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'reviewId', description: 'ID of the review to delete' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async deleteReview(@Param('reviewId') reviewId: string): Promise<UniversalResponseDTO> {
    return this.reviewService.deleteReview(reviewId);
  }
}
