import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './om.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dto/om.dto';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { validateOrReject } from 'class-validator';

describe('OrderService', () => {
    let service: OrderService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: PrismaService,
                    useValue: {
                        order: {
                            create: jest.fn(),
                            findUnique: jest.fn(),
                            findMany: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<OrderService>(OrderService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createOrder', () => {
        // it('should throw BadRequestException if validation fails', async () => {
        //     const createOrderDto: CreateOrderDto = { userId: '', items: [] };
        //     jest.spyOn(validateOrReject, 'mockRejectedValue').mockRejectedValue(new Error('Validation failed'));

        //     await expect(service.createOrder(createOrderDto)).rejects.toThrow(BadRequestException);
        // });

        it('should create an order', async () => {
            const createOrderDto: CreateOrderDto = { userId: 'userId', items: ["item"], totalAmount: 123 };
            const newOrder = { id: 'orderId', ...createOrderDto, status: 'Order Placed', createdAt: new Date(), updatedAt: new Date() };
            jest.spyOn(prismaService.order, 'create').mockResolvedValue(newOrder);

            const result = await service.createOrder(createOrderDto);

            expect(result).toEqual({
                success: true,
                message: 'Order created successfully',
                data: newOrder,
            });
        });

        it('should throw InternalServerErrorException if order creation fails', async () => {
            const createOrderDto: CreateOrderDto = { userId: 'userId', items: ["item"], totalAmount: 123 };
            jest.spyOn(prismaService.order, 'create').mockRejectedValue(new Error('Internal server error'));

            await expect(service.createOrder(createOrderDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('getOrderById', () => {
        it('should throw BadRequestException for invalid orderId', async () => {
            await expect(service.getOrderById('')).rejects.toThrow(BadRequestException);
        });

        // it('should return the order details', async () => {
        //     // '{ id: string; createdAt: Date; updatedAt: Date; items: string[]; userId: string; totalAmount: number; status: string; }'
        //     const order = { id: 'orderId', userId: 'userId', items: [], status: 'Order Placed', createdAt: new Date(), updatedAt: new Date(), totalAmount: 123 };
        //     jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(order);

        //     const result = await service.getOrderById('orderId');

        //     expect(result).toEqual({ success: true, data: order });
        // });

        it('should throw NotFoundException if order is not found', async () => {
            jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(null);

            await expect(service.getOrderById('invalidOrderId')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getAllOrders', () => {
        it('should throw BadRequestException for invalid userId', async () => {
            await expect(service.getAllOrders('')).rejects.toThrow(BadRequestException);
        });

        // it('should return all orders for a user', async () => {
        //     const orders = [{ id: 'orderId1', userId: 'userId', items: [], status: 'Order Placed', createdAt: new Date(), updatedAt: new Date(), totalAmount: 123 }];
        //     jest.spyOn(prismaService.order, 'findMany').mockResolvedValue(orders);

        //     const result = await service.getAllOrders('userId');

        //     expect(result).toEqual({ success: true, data: orders });
        // });
    });

    describe('updateOrderStatus', () => {
        // it('should throw BadRequestException if validation fails', async () => {
        //     const updateOrderStatusDto: UpdateOrderStatusDto = { status: '' };
        //     jest.spyOn(validateOrReject, 'mockRejectedValue').mockRejectedValue(new Error('Validation failed'));

        //     await expect(service.updateOrderStatus('orderId', updateOrderStatusDto)).rejects.toThrow(BadRequestException);
        // });

        it('should throw BadRequestException for invalid orderId', async () => {
            const updateOrderStatusDto: UpdateOrderStatusDto = { status: 'Shipped' };

            await expect(service.updateOrderStatus('', updateOrderStatusDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if order is not found', async () => {
            const updateOrderStatusDto: UpdateOrderStatusDto = { status: 'Shipped' };
            jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(null);

            await expect(service.updateOrderStatus('invalidOrderId', updateOrderStatusDto)).rejects.toThrow(NotFoundException);
        });

        it('should update the order status', async () => {
            const updateOrderStatusDto: UpdateOrderStatusDto = { status: 'Shipped' };
            const order = { 
              id: 'orderId1', 
              createdAt: new Date(), 
              updatedAt: new Date(), 
              items: ["asdf"], 
              status: 'Order Placed',
              userId: 'userId', 
              totalAmount: 123 
            };
        
            // Mock the findUnique method to return a single order object
            jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(order);
            
            // Mock the update method to return the updated order
            jest.spyOn(prismaService.order, 'update').mockResolvedValue({
              ...order,
              status: updateOrderStatusDto.status,
              updatedAt: new Date(),
            });
        
            const result = await service.updateOrderStatus('orderId1', updateOrderStatusDto);
        
            expect(result).toEqual({
              success: true,
              message: 'Order status updated successfully',
              data: {
                ...order,
                status: updateOrderStatusDto.status,
              },
            });
          });
    });

    describe('deleteOrder', () => {
        it('should throw BadRequestException for invalid orderId', async () => {
            await expect(service.deleteOrder('')).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if order is not found', async () => {
            jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(null);

            await expect(service.deleteOrder('invalidOrderId')).rejects.toThrow(NotFoundException);
        });

        it('should delete the order', async () => {
            const order = { 
                id: 'orderId1', 
                createdAt: new Date(), 
                updatedAt: new Date(), 
                items: ["asdf"], 
                status: 'Order Placed',
                userId: 'userId', 
                totalAmount: 123 
              };
            jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(order);
            jest.spyOn(prismaService.order, 'delete').mockResolvedValue(order);

            const result = await service.deleteOrder('orderId');

            expect(result).toEqual({
                success: true,
                message: 'Order cancelled or deleted successfully',
            });
        });
    });
});