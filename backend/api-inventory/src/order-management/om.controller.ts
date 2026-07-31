import { Controller, Post, Get, Put, Delete, Param, Body, ForbiddenException } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { OrderService } from './om.service';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dto/om.dto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Order Management')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto, description: 'Data for creating a new order' })
  @ApiResponse({ status: 201, description: 'The order has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createOrder(
    @Body('data') createOrderDto: CreateOrderDto,
    @CurrentUser('sub') requestingUserId: string,
  ) : Promise<UniversalResponseDTO>{
    return this.orderService.createOrder(createOrderDto, requestingUserId);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get order details by order ID' })
  @ApiParam({ name: 'orderId', description: 'The ID of the order to retrieve' })
  @ApiResponse({ status: 200, description: 'The order details have been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(
    @Param('orderId') orderId: string,
    @CurrentUser('sub') requestingUserId: string,
  ): Promise<UniversalResponseDTO> {
    return this.orderService.getOrderById(orderId, requestingUserId);
  }

  @Get('/user/:userId')
  @ApiOperation({ summary: 'Get all orders for a user' })
  @ApiParam({ name: 'userId', description: 'The ID of the user whose orders are being retrieved' })
  @ApiResponse({ status: 200, description: 'The user\'s orders have been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'No orders found for the user' })
  async getAllOrders(
    @Param('userId') userId: string,
    @CurrentUser('sub') requestingUserId: string,
  ): Promise<UniversalResponseDTO> {
    // A01 — the path param must match the caller; the service only ever
    // returns the authenticated user's own orders.
    if (userId !== requestingUserId) {
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
    return this.orderService.getAllOrders(requestingUserId);
  }

  @Put(':orderId')
  @ApiOperation({ summary: 'Update the status of an order' })
  @ApiParam({ name: 'orderId', description: 'The ID of the order to update' })
  @ApiBody({ type: UpdateOrderStatusDto, description: 'Data for updating the order status' })
  @ApiResponse({ status: 200, description: 'The order status has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('data') updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser('sub') requestingUserId: string,
  ) : Promise<UniversalResponseDTO>{
    return this.orderService.updateOrderStatus(orderId, updateOrderStatusDto, requestingUserId);
  }

  @Delete(':orderId')
  @ApiOperation({ summary: 'Delete an order by ID' })
  @ApiParam({ name: 'orderId', description: 'The ID of the order to delete' })
  @ApiResponse({ status: 200, description: 'The order has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async deleteOrder(
    @Param('orderId') orderId: string,
    @CurrentUser('sub') requestingUserId: string,
  ) : Promise<UniversalResponseDTO>{
    return this.orderService.deleteOrder(orderId, requestingUserId);
  }
}
