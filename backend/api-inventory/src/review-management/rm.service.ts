// src/review-management/review.service.ts

import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from 'src/dto/rm.dto';


@Injectable()
export class ReviewService {
  constructor(private readonly prismaService: PrismaService) {}

  async createReview(createReviewDto: CreateReviewDto) {
    console.log(createReviewDto, "##########")
    const res = await this.prismaService.review.findUnique({where : {id : createReviewDto.productId}})
    //console.log(res, ' is the found response')
    // if(!res){
    //   throw new BadGatewayException({
    //     success : false, 
    //     message : 'invalid product id by ashu'
    //   })
    // }
    // this should be checked once 
    const review = await this.prismaService.review.create({
      data: {
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        productId: createReviewDto.productId,
      },
    });

    return {
      success: true,
      message: 'Review submitted successfully',
      data: review,
    };
  }

  async getReviewsByProduct(productId: string) {
    const reviews = await this.prismaService.review.findMany({
      where: { productId },
    });

    if (!reviews.length) {
      throw new NotFoundException('No reviews found for this product');
    }

    return {
      success: true,
      message: 'Reviews retrieved successfully',
      data: reviews,
    };
  }

  async deleteReview(reviewId: string) {
    const review = await this.prismaService.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.prismaService.review.delete({
      where: { id: reviewId },
    });

    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }
}
