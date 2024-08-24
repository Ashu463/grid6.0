import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Assuming you're using Prisma
import { CreatePaymentDto, RefundPaymentDto } from 'src/dto/pay.dto';


@Injectable()
export class PaymentService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    // Logic to process the payment
    const payment = await this.prismaService.payment.create({
      data: {
        ...createPaymentDto,
        status: 'completed',
        createdAt: new Date(),
      },
    });
    return {
      success: true,
      message: 'Payment processed successfully',
      data: payment,
    };
  }

  async getPaymentDetails(paymentId: string) {
    const payment = await this.prismaService.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }
    return {
      success: true,
      message: 'Payment details retrieved successfully',
      data: payment,
    };
  }

  async processRefund(refundPaymentDto: RefundPaymentDto) {
    // Logic to process the refund
    const refund = await this.prismaService.refund.create({
      data: {
        ...refundPaymentDto,
        status: 'refunded',
        createdAt: new Date(),
      },
    });
    return {
      success: true,
      message: 'Refund processed successfully',
      data: refund,
    };
  }
}
