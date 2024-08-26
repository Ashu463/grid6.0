import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { PaymentService } from './pay.service';
import { CreatePaymentDto, RefundPaymentDto } from 'src/dto/pay.dto';


@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createPayment(@Body('data') createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Get(':paymentId')
  async getPaymentDetails(@Param('paymentId') paymentId: string) {
    return this.paymentService.getPaymentDetails(paymentId);
  }

  @Post('refund')
  async processRefund(@Body('data') refundPaymentDto: RefundPaymentDto) {
    return this.paymentService.processRefund(refundPaymentDto);
  }
}
