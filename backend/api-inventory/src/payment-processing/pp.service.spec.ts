import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './pay.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException, BadGatewayException } from '@nestjs/common';
import { CreatePaymentDto, RefundPaymentDto } from 'src/dto/pay.dto';

describe('PaymentService', () => {
  let service: PaymentService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    refund: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createPayment', () => {
    it('should throw BadRequestException if no data is provided', async () => {
      await expect(service.createPayment(null)).rejects.toThrow(BadRequestException);
    });

    it('should create a payment and return success message', async () => {
      const createPaymentDto: CreatePaymentDto = { orderId : 'test', amount : 123, paymentMethod : 'test', userId : 'testUser' };
      const payment = { ...createPaymentDto, id: 'paymentId', status: 'completed', createdAt: new Date(), updatedAt : new Date() };
      jest.spyOn(prismaService.payment, 'create').mockResolvedValue(payment);

      const result = await service.createPayment(createPaymentDto);
      expect(result).toEqual({
        success: true,
        message: 'Payment processed successfully',
        data: payment,
      });
    });

    it('should throw BadGatewayException if payment creation fails', async () => {
      jest.spyOn(prismaService.payment, 'create').mockRejectedValue(new Error('Creation failed'));

      const createPaymentDto: CreatePaymentDto = { orderId : 'test', amount : 123, paymentMethod : 'test', userId : 'testUser' };
      await expect(service.createPayment(createPaymentDto)).rejects.toThrow(BadGatewayException);
    });
  });

  describe('getPaymentDetails', () => {
    it('should throw BadRequestException if paymentId is not provided', async () => {
      await expect(service.getPaymentDetails(null)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if payment is not found', async () => {
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(null);
      await expect(service.getPaymentDetails('paymentId')).rejects.toThrow(NotFoundException);
    });

    it('should return payment details', async () => {
      const payment = { id: 'paymentId',orderId : 'testId', userId : 'testUser', amount : 123, paymentMethod : 'testCOD', status: 'completed', createdAt: new Date(), updatedAt : new Date() };
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(payment);

      const result = await service.getPaymentDetails('paymentId');
      expect(result).toEqual({
        success: true,
        message: 'Payment details retrieved successfully',
        data: payment,
      });
    });
  });

  describe('processRefund', () => {
    it('should throw BadRequestException if refund data is not provided', async () => {
      await expect(service.processRefund(null)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if payment is not found', async () => {
      const refundPaymentDto: RefundPaymentDto = { paymentId: 'paymentId', refundAmount: 100 };
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(null);
      await expect(service.processRefund(refundPaymentDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if refund amount exceeds payment amount', async () => {
      const refundPaymentDto: RefundPaymentDto = { paymentId: 'paymentId', refundAmount: 200 };
      const payment = { id: 'paymentId',orderId : 'testId', userId : 'testUser', amount : 123, paymentMethod : 'testCOD', status: 'completed', createdAt: new Date(), updatedAt : new Date() };
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(payment);
      await expect(service.processRefund(refundPaymentDto)).rejects.toThrow(BadRequestException);
    });

    it('should process a refund and return success message', async () => {
      const refundPaymentDto: RefundPaymentDto = { paymentId: 'paymentId', refundAmount: 100 };
      const payment = { id: 'paymentId',orderId : 'testId', userId : 'testUser', amount : 123, paymentMethod : 'testCOD', status: 'completed', createdAt: new Date(), updatedAt : new Date() };
      const refund = { id: 'refundId', paymentId: 'paymentId', amount: 100, status: 'refunded', createdAt: new Date(), updatedAt : new Date() };
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(payment);
      jest.spyOn(prismaService.refund, 'create').mockResolvedValue(refund);

      const result = await service.processRefund(refundPaymentDto);
      expect(result).toEqual({
        success: true,
        message: 'Refund processed successfully',
        data: refund,
      });
    });

    it('should throw BadRequestException if refund creation fails', async () => {
      const refundPaymentDto: RefundPaymentDto = { paymentId: 'paymentId', refundAmount: 100 };
      const payment = { id: 'paymentId',orderId : 'testId', userId : 'testUser', amount : 123, paymentMethod : 'testCOD', status: 'completed', createdAt: new Date(), updatedAt : new Date() };
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(payment);
      jest.spyOn(prismaService.refund, 'create').mockRejectedValue(new Error('Refund creation failed'));

      await expect(service.processRefund(refundPaymentDto)).rejects.toThrow(BadRequestException);
    });
  });
});
