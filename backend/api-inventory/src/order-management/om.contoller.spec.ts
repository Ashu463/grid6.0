import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './om.controller';
import { OrderService } from './om.service';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dto/om.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

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
    it('should call orderService.createOrder', async () => {
      const createOrderDto: CreateOrderDto = { userId: '123', items: ["something"] , totalAmount : 123};
      await controller.createOrder(createOrderDto);
      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('getOrder', () => {
    it('should call orderService.getOrderById', async () => {
      const orderId = 'orderId';
      await controller.getOrder(orderId);
      expect(service.getOrderById).toHaveBeenCalledWith(orderId);
    });
  });

  describe('getAllOrders', () => {
    it('should call orderService.getAllOrders', async () => {
      const userId = 'userId';
      await controller.getAllOrders(userId);
      expect(service.getAllOrders).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateOrderStatus', () => {
    it('should call orderService.updateOrderStatus', async () => {
      const orderId = 'orderId';
      const updateOrderStatusDto: UpdateOrderStatusDto = { status: 'Shipped' };
      await controller.updateOrderStatus(orderId, updateOrderStatusDto);
      expect(service.updateOrderStatus).toHaveBeenCalledWith(orderId, updateOrderStatusDto);
    });
  });

  describe('deleteOrder', () => {
    it('should call orderService.deleteOrder', async () => {
      const orderId = 'orderId';
      await controller.deleteOrder(orderId);
      expect(service.deleteOrder).toHaveBeenCalledWith(orderId);
    });
  });
});
