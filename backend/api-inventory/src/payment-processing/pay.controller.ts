import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { PaymentService } from './pay.service';
import { CreatePaymentDto, RefundPaymentDto } from 'src/dto/pay.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiBody({ type: CreatePaymentDto, description: 'Data for creating a new payment' })
  @ApiResponse({ status: 201, description: 'The payment has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPayment(@Body('data') createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Get(':paymentId')
  @ApiOperation({ summary: 'Get payment details by payment ID' })
  @ApiParam({ name: 'paymentId', description: 'The ID of the payment to retrieve' })
  @ApiResponse({ status: 200, description: 'The payment details have been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentDetails(@Param('paymentId') paymentId: string) {
    return this.paymentService.getPaymentDetails(paymentId);
  }

  @Post('refund')
  @ApiOperation({ summary: 'Process a payment refund' })
  @ApiBody({ type: RefundPaymentDto, description: 'Data for processing a refund' })
  @ApiResponse({ status: 201, description: 'The refund has been successfully processed.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async processRefund(@Body('data') refundPaymentDto: RefundPaymentDto) {
    return this.paymentService.processRefund(refundPaymentDto);
  }
}
