// src/order/order.controller.ts

import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { OrderService } from './om.service';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dto/om.dto';


@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body('data') createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string) {
    return this.orderService.getOrderById(orderId);
  }

  @Get()
  async getAllOrders(@Param('userId') userId: string) {
    return this.orderService.getAllOrders(userId);
  }

  @Put(':orderId')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('data') updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(orderId, updateOrderStatusDto);
  }

  @Delete(':orderId')
  async deleteOrder(@Param('orderId') orderId: string) {
    return this.orderService.deleteOrder(orderId);
  }
}
