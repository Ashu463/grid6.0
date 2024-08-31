// src/review-management/review.service.ts

import { BadGatewayException, BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from 'src/dto/rm.dto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

@Injectable()
export class ReviewService {
  private readonly logger: Logger
  constructor(private readonly prismaService: PrismaService) { this.logger = new Logger() }

  async createReview(createReviewDto: CreateReviewDto): Promise<UniversalResponseDTO> {
    if (!createReviewDto) {
      throw new BadRequestException({
        success: false,
        message: 'Please send the data along with the request'
      })
    }
    // Validate if the product exists before creating a review
    const product = await this.prismaService.product.findUnique({
      where: { id: createReviewDto.productId },
    });

    if (!product) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid product ID. Product does not exist.',
      });
    }

    try {
      // Create the review
      const review = await this.prismaService.review.create({
        data: {
          rating: createReviewDto.rating,
          comment: createReviewDto.comment,
          productId: createReviewDto.productId,
        },
      });
      if (!review) {
        throw new BadGatewayException({
          success: false,
          message: 'Send correct parameters. Review not created'
        })
      }

      return {
        success: true,
        message: 'Review submitted successfully',
        data: review,
      };

    } catch (error) {
      this.logger.log(error)
      throw new BadGatewayException({
        success: false,
        message: 'error occured while accessing the product'
      })
    }


  }

  async getReviewsByProduct(productId: string): Promise<UniversalResponseDTO> {
    if (!productId) {
      throw new BadRequestException({
        success: false,
        message: 'Please send the product id along with the request'
      })
    }
    // Validate if the product exists before fetching reviews
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException({
        success: false,
        message: 'Invalid product ID. Product does not exist.',
      });
    }

    try {
      const reviews = await this.prismaService.review.findMany({
        where: { productId },
      });

      if (!reviews.length) {
        throw new NotFoundException({
          success: false,
          message: 'No reviews found for this product.',
        });
      }

      return {
        success: true,
        message: 'Reviews retrieved successfully',
        data: reviews,
      };
    } catch (error) {
      this.logger.log(error)
      throw new BadGatewayException({
        success: false,
        message: 'error occured while accessing the product'
      })
    }
  }

  async deleteReview(reviewId: string): Promise<UniversalResponseDTO> {
    if (!reviewId) {
      throw new BadRequestException({
        success: false,
        message: 'Please send the request id along with the request'
      })
    }
    try {
      const review = await this.prismaService.review.findUnique({
        where: { id: reviewId },
      });

      if (!review) {
        throw new NotFoundException({
          success: false,
          message: 'Review not found.',
        });
      }

      await this.prismaService.review.delete({
        where: { id: reviewId },
      });

      return {
        success: true,
        message: 'Review deleted successfully',
      };
    } catch (error) {
      this.logger.log(error)
      throw new BadGatewayException({
        success: false,
        message: 'error occured while accessing the review of the product'
      })
    }

  }
}
