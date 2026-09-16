import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './pay.controller';
import { PaymentService } from './pay.service';
import { CreatePaymentDto, RefundPaymentDto } from 'src/dto/pay.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PaymentController', () => {
  let controller: PaymentController;
  let service: PaymentService;

  const mockPaymentService = {
    createPayment: jest.fn(),
    getPaymentDetails: jest.fn(),
    processRefund: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        { provide: PaymentService, useValue: mockPaymentService },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    service = module.get<PaymentService>(PaymentService);
  });

  const requestingUserId = 'testUser';

  describe('createPayment', () => {
    it('should call PaymentService.createPayment with the correct data', async () => {
      const createPaymentDto: CreatePaymentDto = { orderId : 'test', amount : 123, paymentMethod : 'test', userId : 'testUser' };
      await controller.createPayment(createPaymentDto, requestingUserId);
      expect(service.createPayment).toHaveBeenCalledWith(createPaymentDto, requestingUserId);
    });
  });

  describe('getPaymentDetails', () => {
    it('should call PaymentService.getPaymentDetails with the correct paymentId', async () => {
      const paymentId = 'paymentId';
      await controller.getPaymentDetails(paymentId, requestingUserId);
      expect(service.getPaymentDetails).toHaveBeenCalledWith(paymentId, requestingUserId);
    });
  });

  describe('processRefund', () => {
    it('should call PaymentService.processRefund with the correct data', async () => {
      const refundPaymentDto: RefundPaymentDto = { paymentId : 'testId' , refundAmount : 123 };
      await controller.processRefund(refundPaymentDto, requestingUserId);
      expect(service.processRefund).toHaveBeenCalledWith(refundPaymentDto, requestingUserId);
    });
  });
});
