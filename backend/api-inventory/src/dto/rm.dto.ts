// src/dto/review.dto.ts
import { IsString } from 'class-validator';
import { DoesNotEndWithHyphen } from 'src/utils/hyphen';

export class CreateReviewDto {
  rating: number;

  @IsString()
  @DoesNotEndWithHyphen({ message: 'Comment should not end with a hyphen.' })
  comment: string;

  productId: string;
}

export class UpdateReviewDto {
  rating?: number;

  @IsString()
  @DoesNotEndWithHyphen({ message: 'Comment should not end with a hyphen.' })
  comment?: string;
}
