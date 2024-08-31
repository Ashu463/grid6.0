import { Module } from '@nestjs/common';
import { PaymentController } from './pay.controller';
import { PaymentService } from './pay.service';
import { PrismaService } from 'src/prisma/prisma.service';


@Module({
  imports: [],
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService],
})
export class PayModule {}
