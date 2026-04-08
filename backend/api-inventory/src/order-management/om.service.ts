// src/order/order.service.ts

import { Injectable, BadRequestException, NotFoundException, Logger, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dto/om.dto';
import { validateOrReject } from 'class-validator';
import { error } from 'console';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(private readonly prismaService: PrismaService) {}
 
  async createOrder(
    createOrderDto: CreateOrderDto,
    requestingUserId: string,  // A01 — userId from JWT, never from body
  ): Promise<UniversalResponseDTO> {
    try {
      await validateOrReject(createOrderDto);
    } catch {
      throw new BadRequestException({ success: false, message: 'Invalid input data' });
    }
 
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException({ success: false, message: 'Order must contain at least one item' });
    }
 
    try {
      const order = await this.prismaService.order.create({
        data: {
          id: randomUUID(),
          userId: requestingUserId,  // A01 — always use the verified JWT userId
          items: createOrderDto.items,
          status: 'Order Placed',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return { success: true, message: 'Order created successfully', data: order };
    } catch (error) {
      this.logger.error('Error creating order', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
 
  async getOrderById(orderId: string, requestingUserId: string): Promise<UniversalResponseDTO> {
    if (!orderId || typeof orderId !== 'string') {
      throw new BadRequestException({ success: false, message: 'Invalid order ID' });
    }
 
    const order = await this.prismaService.order.findUnique({ where: { id: orderId } });
 
    // BUG FIX — null check MUST come before property access (original code crashed on missing order)
    if (!order) {
      throw new NotFoundException({ success: false, message: `Order ${orderId} not found` });
    }
 
    // A01 — BUG FIX: was comparing order.userId !== orderId (comparing userId to orderId)
    if (order.userId !== requestingUserId) {
      // logSecurityEvent('ORDER_UNAUTHORIZED_ACCESS', { requestingUserId, orderId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    return { success: true, message: 'Order retrieved successfully', data: order };
  }
 
  async getAllOrders(requestingUserId: string): Promise<UniversalResponseDTO> {
    if (!requestingUserId || typeof requestingUserId !== 'string') {
      throw new BadRequestException({ success: false, message: 'Invalid user ID' });
    }
    // A01 — only return orders belonging to the authenticated user
    const orders = await this.prismaService.order.findMany({ where: { userId: requestingUserId } });
    return { success: true, message: 'Orders retrieved successfully', data: orders };
  }
 
  async updateOrderStatus(
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    requestingUserId: string,
  ): Promise<UniversalResponseDTO> {
    try {
      await validateOrReject(updateOrderStatusDto);
    } catch {
      throw new BadRequestException({ success: false, message: 'Invalid status data' });
    }
 
    if (!orderId || typeof orderId !== 'string') {
      throw new BadRequestException({ success: false, message: 'Invalid order ID' });
    }
 
    const order = await this.prismaService.order.findUnique({ where: { id: orderId } });
 
    if (!order) {
      throw new NotFoundException({ success: false, message: `Order ${orderId} not found` });
    }
 
    // A01 — ownership check
    if (order.userId !== requestingUserId) {
      // logSecurityEvent('ORDER_STATUS_UPDATE_UNAUTHORIZED', { requestingUserId, orderId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    const updatedOrder = await this.prismaService.order.update({
      where: { id: orderId },
      data: { status: updateOrderStatusDto.status, updatedAt: new Date() },
    });
    return { success: true, message: 'Order status updated successfully', data: updatedOrder };
  }
 
  async deleteOrder(orderId: string, requestingUserId: string): Promise<UniversalResponseDTO> {
    if (!orderId || typeof orderId !== 'string') {
      throw new BadRequestException({ success: false, message: 'Invalid order ID' });
    }
 
    const order = await this.prismaService.order.findUnique({ where: { id: orderId } });
 
    if (!order) {
      throw new NotFoundException({ success: false, message: `Order ${orderId} not found` });
    }
 
    // A01 — ownership check
    if (order.userId !== requestingUserId) {
      // logSecurityEvent('ORDER_DELETE_UNAUTHORIZED', { requestingUserId, orderId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    await this.prismaService.order.delete({ where: { id: orderId } });
    return { success: true, message: 'Order cancelled successfully' };
  }
}
 