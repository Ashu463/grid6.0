import { Injectable, BadRequestException, BadGatewayException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, RefundPaymentDto } from 'src/dto/pay.dto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPayment(createPaymentDto: CreatePaymentDto) : Promise<UniversalResponseDTO> {
    if (!createPaymentDto) {
      throw new BadRequestException({
        success: false ,
        message : 'Please provide valid payment data.'
      });
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
      throw new BadGatewayException({
        success : false,
        message : 'Failed to process payment. Please try again later.'
      });
    }
  }

  async getPaymentDetails(paymentId: string) : Promise<UniversalResponseDTO> {
    if (!paymentId) {
      throw new BadRequestException({
        success : false,
        message : 'Please provide a valid payment ID.'
      });
    }

    const payment = await this.prismaService.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException({
        success : false,
        message : 'Payment not found.'
      });
    }

    return {
      success: true,
      message: 'Payment details retrieved successfully',
      data: payment,
    };
  }

  async processRefund(refundPaymentDto: RefundPaymentDto) : Promise<UniversalResponseDTO> {
    if (!refundPaymentDto) {
      throw new BadRequestException({
        success : false,
        message : 'Please provide valid refund data.'
      });
    }

    const payment = await this.prismaService.payment.findUnique({
      where: { id: refundPaymentDto.paymentId },
    });

    if (!payment) {
      throw new NotFoundException({
        success : false,
        message : 'Payment not found with the provided ID.'
      });
    }

    if (refundPaymentDto.refundAmount > payment.amount) {
      throw new BadRequestException({
        success : false,
        message : 'Refund amount exceeds the original payment amount.'
      });
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