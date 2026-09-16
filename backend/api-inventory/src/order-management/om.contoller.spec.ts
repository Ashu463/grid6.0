import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './om.controller';
import { OrderService } from './om.service';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dto/om.dto';
import { ForbiddenException } from '@nestjs/common';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const requestingUserId = 'userId';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            createOrder: jest.fn(),
            getOrderById: jest.fn(),
            getAllOrders: jest.fn(),
            updateOrderStatus: jest.fn(),
            deleteOrder: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should call orderService.createOrder with the requesting user id', async () => {
      const createOrderDto: CreateOrderDto = { userId: '123', items: ["something"] , totalAmount : 123};
      await controller.createOrder(createOrderDto, requestingUserId);
      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto, requestingUserId);
    });
  });

  describe('getOrder', () => {
    it('should call orderService.getOrderById with the requesting user id', async () => {
      const orderId = 'orderId';
      await controller.getOrder(orderId, requestingUserId);
      expect(service.getOrderById).toHaveBeenCalledWith(orderId, requestingUserId);
    });
  });

  describe('getAllOrders', () => {
    it('should call orderService.getAllOrders when the path userId matches the token', async () => {
      await controller.getAllOrders(requestingUserId, requestingUserId);
      expect(service.getAllOrders).toHaveBeenCalledWith(requestingUserId);
    });

    it('should throw ForbiddenException when the path userId does not match the token (BOLA)', async () => {
      await expect(controller.getAllOrders('someoneElse', requestingUserId)).rejects.toThrow(ForbiddenException);
      expect(service.getAllOrders).not.toHaveBeenCalled();
    });
  });

  describe('updateOrderStatus', () => {
    it('should call orderService.updateOrderStatus with the requesting user id', async () => {
      const orderId = 'orderId';
      const updateOrderStatusDto: UpdateOrderStatusDto = { status: 'Shipped' };
      await controller.updateOrderStatus(orderId, updateOrderStatusDto, requestingUserId);
      expect(service.updateOrderStatus).toHaveBeenCalledWith(orderId, updateOrderStatusDto, requestingUserId);
    });
  });

  describe('deleteOrder', () => {
    it('should call orderService.deleteOrder with the requesting user id', async () => {
      const orderId = 'orderId';
      await controller.deleteOrder(orderId, requestingUserId);
      expect(service.deleteOrder).toHaveBeenCalledWith(orderId, requestingUserId);
    });
  });
});
