import { Injectable, BadRequestException, BadGatewayException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, RefundPaymentDto } from 'src/dto/pay.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    if (!createPaymentDto) {
      throw new BadRequestException('Please provide valid payment data.');
    }

    try {
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
    } catch (error) {
      throw new BadGatewayException('Failed to process payment. Please try again later.');
    }
  }

  async getPaymentDetails(paymentId: string) {
    if (!paymentId) {
      throw new BadRequestException('Please provide a valid payment ID.');
    }

    const payment = await this.prismaService.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    return {
      success: true,
      message: 'Payment details retrieved successfully',
      data: payment,
    };
  }

  async processRefund(refundPaymentDto: RefundPaymentDto) {
    if (!refundPaymentDto) {
      throw new BadRequestException('Please provide valid refund data.');
    }

    const payment = await this.prismaService.payment.findUnique({
      where: { id: refundPaymentDto.paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found with the provided ID.');
    }

    if (refundPaymentDto.refundAmount > payment.amount) {
      throw new BadRequestException('Refund amount exceeds the original payment amount.');
    }

    try {
      const refund = await this.prismaService.refund.create({
        data: {
          paymentId: refundPaymentDto.paymentId,  
          amount: refundPaymentDto.refundAmount,        // Use 'amount' instead of 'refundAmount'
          status: 'refunded',
          createdAt: new Date(),
        },
      });
    
      return {
        success: true,
        message: 'Refund processed successfully',
        data: refund,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'Error processing refund',
        error: error.message,
      });
    }
    
  }
}
