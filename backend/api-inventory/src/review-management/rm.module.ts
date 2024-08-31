// src/review-management/review.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewService } from './rm.service';
import { ReviewController } from './rm.controller';


@Module({
  providers: [ReviewService, PrismaService],
  controllers: [ReviewController],
})
export class ReviewModule {}
