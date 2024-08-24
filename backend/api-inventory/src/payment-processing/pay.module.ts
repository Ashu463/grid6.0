import { Module } from '@nestjs/common';
import { PaymentController } from './pay.controller';
import { PaymentService } from './pay.service';


@Module({
  imports: [],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PayModule {}
