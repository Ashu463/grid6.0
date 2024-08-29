import { Controller, Post, Get, Body, Param, Delete, Put, Headers } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { AddItemToCartDto, CreateCartDto, UpdateCartItemDto } from 'src/dto/cm.dto';
import { CartService } from './cm.service';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cart' })
  @ApiBody({ type: CreateCartDto, description: 'Data for creating a new cart' })
  @ApiResponse({ status: 201, description: 'The cart has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createCart(@Body('data') createCartDto: CreateCartDto) {
    console.log(createCartDto, " is the data going from controller")
    return this.cartService.createCart(createCartDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get the cart of a user' })
  @ApiBody({ description: 'User ID', type: String })
  @ApiResponse({ status: 200, description: 'The cart has been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async getCart(@Body('userId') userId: string) {
    console.log("controller se req gyi", userId)
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item to the cart' })
  @ApiBody({ type: AddItemToCartDto, description: 'Data for adding an item to the cart' })
  @ApiResponse({ status: 201, description: 'The item has been successfully added to the cart.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async addItemToCart(@Body('userId') userId: string, @Body() addItemToCartDto: AddItemToCartDto) {
    return this.cartService.addItemToCart(userId, addItemToCartDto);
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update an item in the cart' })
  @ApiParam({ name: 'itemId', description: 'The ID of the item to update' })
  @ApiBody({ type: UpdateCartItemDto, description: 'Data for updating an item in the cart' })
  @ApiResponse({ status: 200, description: 'The item has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async updateCartItem(@Param('itemId') itemId: string, @Body() updateCartItemDto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(itemId, updateCartItemDto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiParam({ name: 'itemId', description: 'The ID of the item to remove' })
  @ApiResponse({ status: 200, description: 'The item has been successfully removed.' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async removeItemFromCart(@Param('itemId') itemId: string) {
    return this.cartService.removeItemFromCart(itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear the cart' })
  @ApiBody({ description: 'User ID', type: String })
  @ApiResponse({ status: 200, description: 'The cart has been successfully cleared.' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async clearCart(@Body('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
