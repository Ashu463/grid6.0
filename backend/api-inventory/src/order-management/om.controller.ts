// src/order/order.controller.ts

import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { OrderService } from './om.service';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dto/om.dto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';


@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body('data') createOrderDto: CreateOrderDto) : Promise<UniversalResponseDTO>{
    return this.orderService.createOrder(createOrderDto);
  }

  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string): Promise<UniversalResponseDTO> {
    return this.orderService.getOrderById(orderId);
  }

  @Get('/user/:userId')
  async getAllOrders(@Param('userId') userId: string): Promise<UniversalResponseDTO> {
    return this.orderService.getAllOrders(userId);
  }

  @Put(':orderId')
  async updateOrderStatus (
    @Param('orderId') orderId: string,
    @Body('data') updateOrderStatusDto: UpdateOrderStatusDto,
  ) : Promise<UniversalResponseDTO>{
    return this.orderService.updateOrderStatus(orderId, updateOrderStatusDto);
  }

  @Delete(':orderId')
  async deleteOrder(@Param('orderId') orderId: string) : Promise<UniversalResponseDTO>{
    return this.orderService.deleteOrder(orderId);
  }
}

