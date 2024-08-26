// src/dto/review.dto.ts

export class CreateReviewDto {
    rating: number;
    comment: string;
    productId: string;
  }
  
  export class UpdateReviewDto {
    rating?: number;
    comment?: string;
  }
  