import { Injectable, BadRequestException, BadGatewayException, NotFoundException, InternalServerErrorException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, RefundPaymentDto } from 'src/dto/pay.dto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(private readonly prismaService: PrismaService) {}
 
  async createPayment(
    createPaymentDto: CreatePaymentDto,
    requestingUserId: string,
  ): Promise<UniversalResponseDTO> {
    if (!createPaymentDto) {
      throw new BadRequestException({ success: false, message: 'Payment data is required' });
    }
 
    try {
      const payment = await this.prismaService.payment.create({
        data: {
          ...createPaymentDto,
          userId: requestingUserId,  // A01 — bind to authenticated user, not body
          status: 'completed',
          createdAt: new Date(),
        },
      });
      return { success: true, message: 'Payment processed successfully', data: payment };
    } catch (error) {
      // A05 — never expose internal error detail to the client
      this.logger.error('Payment creation failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Payment processing failed' });
    }
  }
 
  async getPaymentDetails(paymentId: string, requestingUserId: string): Promise<UniversalResponseDTO> {
    if (!paymentId) {
      throw new BadRequestException({ success: false, message: 'Payment ID is required' });
    }
 
    const payment = await this.prismaService.payment.findUnique({ where: { id: paymentId } });
 
    if (!payment) {
      throw new NotFoundException({ success: false, message: 'Payment not found' });
    }
 
    // A01 — payment must belong to the requesting user
    if (payment.userId !== requestingUserId) {
      // logSecurityEvent('PAYMENT_UNAUTHORIZED_ACCESS', { requestingUserId, paymentId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    return { success: true, message: 'Payment details retrieved successfully', data: payment };
  }
 
  async processRefund(
    refundPaymentDto: RefundPaymentDto,
    requestingUserId: string,
  ): Promise<UniversalResponseDTO> {
    if (!refundPaymentDto) {
      throw new BadRequestException({ success: false, message: 'Refund data is required' });
    }
 
    const payment = await this.prismaService.payment.findUnique({
      where: { id: refundPaymentDto.paymentId },
    });
 
    if (!payment) {
      throw new NotFoundException({ success: false, message: 'Payment not found' });
    }
 
    // A01 — only the payment owner can request a refund
    if (payment.userId !== requestingUserId) {
      // logSecurityEvent('REFUND_UNAUTHORIZED', { requestingUserId, paymentId: refundPaymentDto.paymentId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    if (refundPaymentDto.refundAmount > payment.amount) {
      throw new BadRequestException({
        success: false,
        message: 'Refund amount exceeds the original payment amount',
      });
    }
 
    try {
      const refund = await this.prismaService.refund.create({
        data: {
          paymentId: refundPaymentDto.paymentId,
          amount: refundPaymentDto.refundAmount,
          status: 'refunded',
          createdAt: new Date(),
        },
      });
      return { success: true, message: 'Refund processed successfully', data: refund };
    } catch (error) {
      this.logger.error('Refund processing failed', error);
      // A05 — don't expose error.message to the client
      throw new InternalServerErrorException({ success: false, message: 'Refund processing failed' });
    }
  }
}