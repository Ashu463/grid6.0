import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './pay.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { CreatePaymentDto, RefundPaymentDto } from 'src/dto/pay.dto';

describe('PaymentService', () => {
  let service: PaymentService;
  let prismaService: PrismaService;

  const requestingUserId = 'testUser';

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
      await expect(service.createPayment(null, requestingUserId)).rejects.toThrow(BadRequestException);
    });

    it('should create a payment bound to the requesting user and return success message', async () => {
      const createPaymentDto: CreatePaymentDto = { orderId : 'test', amount : 123, paymentMethod : 'test', userId : 'testUser' };
      const payment = { ...createPaymentDto, userId: requestingUserId, id: 'paymentId', status: 'completed', createdAt: new Date(), updatedAt : new Date() };
      jest.spyOn(prismaService.payment, 'create').mockResolvedValue(payment);

      const result = await service.createPayment(createPaymentDto, requestingUserId);
      expect(prismaService.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: requestingUserId }),
      });
      expect(result).toEqual({
        success: true,
        message: 'Payment processed successfully',
        data: payment,
      });
    });

    it('should throw InternalServerErrorException if payment creation fails', async () => {
      jest.spyOn(prismaService.payment, 'create').mockRejectedValue(new Error('Creation failed'));

      const createPaymentDto: CreatePaymentDto = { orderId : 'test', amount : 123, paymentMethod : 'test', userId : 'testUser' };
      await expect(service.createPayment(createPaymentDto, requestingUserId)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getPaymentDetails', () => {
    it('should throw BadRequestException if paymentId is not provided', async () => {
      await expect(service.getPaymentDetails(null, requestingUserId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if payment is not found', async () => {
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(null);
      await expect(service.getPaymentDetails('paymentId', requestingUserId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if the payment belongs to another user', async () => {
      const payment = { id: 'paymentId', orderId: 'testId', userId: 'someoneElse', amount: 123, paymentMethod: 'testCOD', status: 'completed', createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(payment);
      await expect(service.getPaymentDetails('paymentId', requestingUserId)).rejects.toThrow(ForbiddenException);
    });

    it('should return payment details for the owning user', async () => {
      const payment = { id: 'paymentId',orderId : 'testId', userId : requestingUserId, amount : 123, paymentMethod : 'testCOD', status: 'completed', createdAt: new Date(), updatedAt : new Date() };
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(payment);

      const result = await service.getPaymentDetails('paymentId', requestingUserId);
      expect(result).toEqual({
        success: true,
        message: 'Payment details retrieved successfully',
        data: payment,
      });
    });
  });

  describe('processRefund', () => {
    it('should throw BadRequestException if refund data is not provided', async () => {
      await expect(service.processRefund(null, requestingUserId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if payment is not found', async () => {
      const refundPaymentDto: RefundPaymentDto = { paymentId: 'paymentId', refundAmount: 100 };
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(null);
      await expect(service.processRefund(refundPaymentDto, requestingUserId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if the payment belongs to another user', async () => {
      const refundPaymentDto: RefundPaymentDto = { paymentId: 'paymentId', refundAmount: 100 };
      const payment = { id: 'paymentId', orderId: 'testId', userId: 'someoneElse', amount: 123, paymentMethod: 'testCOD', status: 'completed', createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(payment);
      await expect(service.processRefund(refundPaymentDto, requestingUserId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if refund amount exceeds payment amount', async () => {
      const refundPaymentDto: RefundPaymentDto = { paymentId: 'paymentId', refundAmount: 200 };
      const payment = { id: 'paymentId',orderId : 'testId', userId : requestingUserId, amount : 123, paymentMethod : 'testCOD', status: 'completed', createdAt: new Date(), updatedAt : new Date() };
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(payment);
      await expect(service.processRefund(refundPaymentDto, requestingUserId)).rejects.toThrow(BadRequestException);
    });

    it('should process a refund and return success message', async () => {
      const refundPaymentDto: RefundPaymentDto = { paymentId: 'paymentId', refundAmount: 100 };
      const payment = { id: 'paymentId',orderId : 'testId', userId : requestingUserId, amount : 123, paymentMethod : 'testCOD', status: 'completed', createdAt: new Date(), updatedAt : new Date() };
      const refund = { id: 'refundId', paymentId: 'paymentId', amount: 100, status: 'refunded', createdAt: new Date(), updatedAt : new Date() };
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(payment);
      jest.spyOn(prismaService.refund, 'create').mockResolvedValue(refund);

      const result = await service.processRefund(refundPaymentDto, requestingUserId);
      expect(result).toEqual({
        success: true,
        message: 'Refund processed successfully',
        data: refund,
      });
    });

    it('should throw InternalServerErrorException if refund creation fails', async () => {
      const refundPaymentDto: RefundPaymentDto = { paymentId: 'paymentId', refundAmount: 100 };
      const payment = { id: 'paymentId',orderId : 'testId', userId : requestingUserId, amount : 123, paymentMethod : 'testCOD', status: 'completed', createdAt: new Date(), updatedAt : new Date() };
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(payment);
      jest.spyOn(prismaService.refund, 'create').mockRejectedValue(new Error('Refund creation failed'));

      await expect(service.processRefund(refundPaymentDto, requestingUserId)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
