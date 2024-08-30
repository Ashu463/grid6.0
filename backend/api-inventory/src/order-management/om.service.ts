// src/order/order.service.ts

import { Injectable, BadRequestException, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dto/om.dto';
import { validateOrReject } from 'class-validator';
import { error } from 'console';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    // Validate input DTO
    try {
      await validateOrReject(createOrderDto);
    } catch (errors) {
      this.logger.log(error)
      throw new BadRequestException({
        sucees : false,
        message : 'Invalid input data',
      });
    }

    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException({
        success : false, 
        message : 'Order must contain at least one item'
      })
    }

    const newOrder = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...createOrderDto,
      status: 'Order Placed',
    };

    try {
      const order = await this.prismaService.order.create({ data: newOrder });
      
      return {
        success: true,
        message: 'Order created successfully',
        data: order,
      };
    } catch (error) {
      this.logger.error('Error creating order', error);
      throw new InternalServerErrorException({
        success : false, 
        message : 'internal server error occured'
      })
    }
  }

  async getOrderById(orderId: string) {
    if (!orderId || typeof orderId !== 'string') {
      throw new BadRequestException({
        success : false,
        message : 'Invalid order ID.'
      });
    }

    const order = await this.prismaService.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException({
        success : false,
        message : `Order with id ${orderId} not found.`
      });
    }

    return {
      success: true,
      data: order,
    };
  }

  async getAllOrders(userId: string) {
    console.log(userId, ' req aa gyi from controller')

    if (!userId || typeof userId !== 'string') {
      throw new BadRequestException({
        success : false,
        message : 'Invalid user ID.'
      });
    }

    const orders = await this.prismaService.order.findMany({ where: { userId } });

    return {
      success: true,
      data: orders,
    };
  }

  async updateOrderStatus(orderId: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    // Validate input DTO
    try {
      await validateOrReject(updateOrderStatusDto);
    } catch (errors) {
      this.logger.log(error)
      throw new BadRequestException({
        success : false,
        message : 'Invalid status update data'
      });
    }

    if (!orderId || typeof orderId !== 'string') {
      throw new BadRequestException({
        success : false,
        message : 'Invalid order ID.'
      });
    }

    const order = await this.prismaService.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException({
        success : false,
        message : `Order with id ${orderId} not found.`
      });
    }

    const updatedOrder = await this.prismaService.order.update({
      where: { id: orderId },
      data: { status: updateOrderStatusDto.status, updatedAt: new Date() },
    });

    return {
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    };
  }

  async deleteOrder(orderId: string) {
    if (!orderId || typeof orderId !== 'string') {
      throw new BadRequestException({
        success : false,
        message : 'Invalid order ID.'
      });
    }

    const order = await this.prismaService.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException({
        success : false,
        message : `Order with id ${orderId} not found.`
      });
    }

    await this.prismaService.order.delete({ where: { id: orderId } });

    return {
      success: true,
      message: 'Order cancelled or deleted successfully',
    };
  }
}
