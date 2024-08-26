// src/order/order.service.ts

import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dto/om.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item.');
    }

    const newOrder = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...createOrderDto,
      status: 'PENDING',
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
      throw new BadRequestException('Could not create order.');
    }
  }

  async getOrderById(orderId: string) {
    const order = await this.prismaService.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found.`);
    }

    return {
      success: true,
      data: order,
    };
  }

  async getAllOrders(userId: string) {
    const orders = await this.prismaService.order.findMany({ where: { userId } });

    return {
      success: true,
      data: orders,
    };
  }

  async updateOrderStatus(orderId: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.prismaService.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found.`);
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
    const order = await this.prismaService.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found.`);
    }

    await this.prismaService.order.delete({ where: { id: orderId } });

    return {
      success: true,
      message: 'Order cancelled or deleted successfully',
    };
  }
}
