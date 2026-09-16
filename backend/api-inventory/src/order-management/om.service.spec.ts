import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './om.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dto/om.dto';
import { BadRequestException, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';

describe('OrderService', () => {
    let service: OrderService;
    let prismaService: PrismaService;

    const requestingUserId = 'userId';

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
        it('should create an order bound to the requesting user', async () => {
            const createOrderDto: CreateOrderDto = { userId: 'someoneElse', items: ["item"], totalAmount: 123 };
            const newOrder = { id: 'orderId', userId: requestingUserId, items: createOrderDto.items, totalAmount: createOrderDto.totalAmount, status: 'Order Placed', createdAt: new Date(), updatedAt: new Date() };
            jest.spyOn(prismaService.order, 'create').mockResolvedValue(newOrder);

            const result = await service.createOrder(createOrderDto, requestingUserId);

            // A01 — always bound to the verified JWT userId, never the body
            expect(prismaService.order.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ userId: requestingUserId, totalAmount: createOrderDto.totalAmount }),
            });
            expect(result).toEqual({
                success: true,
                message: 'Order created successfully',
                data: newOrder,
            });
        });

        it('should throw InternalServerErrorException if order creation fails', async () => {
            const createOrderDto: CreateOrderDto = { userId: 'userId', items: ["item"], totalAmount: 123 };
            jest.spyOn(prismaService.order, 'create').mockRejectedValue(new Error('Internal server error'));

            await expect(service.createOrder(createOrderDto, requestingUserId)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('getOrderById', () => {
        it('should throw BadRequestException for invalid orderId', async () => {
            await expect(service.getOrderById('', requestingUserId)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if order is not found', async () => {
            jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(null);

            await expect(service.getOrderById('invalidOrderId', requestingUserId)).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if the order belongs to another user (BOLA)', async () => {
            const order = { id: 'orderId', userId: 'someoneElse', items: [], status: 'Order Placed', createdAt: new Date(), updatedAt: new Date(), totalAmount: 123 };
            jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(order);

            await expect(service.getOrderById('orderId', requestingUserId)).rejects.toThrow(ForbiddenException);
        });

        it('should return the order details for the owning user', async () => {
            const order = { id: 'orderId', userId: requestingUserId, items: [], status: 'Order Placed', createdAt: new Date(), updatedAt: new Date(), totalAmount: 123 };
            jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(order);

            const result = await service.getOrderById('orderId', requestingUserId);

            expect(result).toEqual({ success: true, message: 'Order retrieved successfully', data: order });
        });
    });

    describe('getAllOrders', () => {
        it('should throw BadRequestException for invalid userId', async () => {
            await expect(service.getAllOrders('')).rejects.toThrow(BadRequestException);
        });

        it('should return all orders for the requesting user only', async () => {
            const orders = [{ id: 'orderId1', userId: requestingUserId, items: [], status: 'Order Placed', createdAt: new Date(), updatedAt: new Date(), totalAmount: 123 }];
            jest.spyOn(prismaService.order, 'findMany').mockResolvedValue(orders);

            const result = await service.getAllOrders(requestingUserId);

            expect(prismaService.order.findMany).toHaveBeenCalledWith({ where: { userId: requestingUserId } });
            expect(result).toEqual({ success: true, message: 'Orders retrieved successfully', data: orders });
        });
    });

    describe('updateOrderStatus', () => {
        it('should throw BadRequestException for invalid orderId', async () => {
            const updateOrderStatusDto: UpdateOrderStatusDto = { status: 'Shipped' };

            await expect(service.updateOrderStatus('', updateOrderStatusDto, requestingUserId)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if order is not found', async () => {
            const updateOrderStatusDto: UpdateOrderStatusDto = { status: 'Shipped' };
            jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(null);

            await expect(service.updateOrderStatus('invalidOrderId', updateOrderStatusDto, requestingUserId)).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if the order belongs to another user (BOLA)', async () => {
            const updateOrderStatusDto: UpdateOrderStatusDto = { status: 'Shipped' };
            const order = { id: 'orderId1', createdAt: new Date(), updatedAt: new Date(), items: ["asdf"], status: 'Order Placed', userId: 'someoneElse', totalAmount: 123 };
            jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(order);

            await expect(service.updateOrderStatus('orderId1', updateOrderStatusDto, requestingUserId)).rejects.toThrow(ForbiddenException);
        });

        it('should update the order status', async () => {
            const updateOrderStatusDto: UpdateOrderStatusDto = { status: 'Shipped' };
            const order = {
              id: 'orderId1',
              createdAt: new Date(),
              updatedAt: new Date(),
              items: ["asdf"],
              status: 'Order Placed',
              userId: requestingUserId,
              totalAmount: 123
            };

            jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(order);

            jest.spyOn(prismaService.order, 'update').mockResolvedValue({
              ...order,
              status: updateOrderStatusDto.status,
              updatedAt: new Date(),
            });

            const result = await service.updateOrderStatus('orderId1', updateOrderStatusDto, requestingUserId);

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
            await expect(service.deleteOrder('', requestingUserId)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if order is not found', async () => {
            jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(null);

            await expect(service.deleteOrder('invalidOrderId', requestingUserId)).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if the order belongs to another user (BOLA)', async () => {
            const order = { id: 'orderId1', createdAt: new Date(), updatedAt: new Date(), items: ["asdf"], status: 'Order Placed', userId: 'someoneElse', totalAmount: 123 };
            jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(order);

            await expect(service.deleteOrder('orderId1', requestingUserId)).rejects.toThrow(ForbiddenException);
        });

        it('should delete the order', async () => {
            const order = {
                id: 'orderId1',
                createdAt: new Date(),
                updatedAt: new Date(),
                items: ["asdf"],
                status: 'Order Placed',
                userId: requestingUserId,
                totalAmount: 123
              };
            jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(order);
            jest.spyOn(prismaService.order, 'delete').mockResolvedValue(order);

            const result = await service.deleteOrder('orderId1', requestingUserId);

            expect(result).toEqual({
                success: true,
                message: 'Order cancelled successfully',
            });
        });
    });
});
