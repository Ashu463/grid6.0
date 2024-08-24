import { Controller, Post, Get, Body, Param, Delete, Put, Headers } from '@nestjs/common';
import { AddItemToCartDto, CreateCartDto, UpdateCartItemDto } from 'src/dto/cm.dto';
import { CartService } from './cm.service';
import { json } from 'stream/consumers';


@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async createCart(@Body('data') createCartDto: CreateCartDto) {
    console.log(createCartDto, " is the data going from controller")
    return this.cartService.createCart(createCartDto);
  }

  @Get()
  async getCart(@Body('userId') userId: string) {
    console.log("controller se req gyi", userId)
    return this.cartService.getCart(userId);
  }

  @Post('items')
  async addItemToCart(@Body('userId') userId: string, @Body() addItemToCartDto: AddItemToCartDto) {
    return this.cartService.addItemToCart(userId, addItemToCartDto);
  }

  @Put('items/:itemId')
  async updateCartItem(@Param('itemId') itemId: string, @Body() updateCartItemDto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(itemId, updateCartItemDto);
  }

  @Delete('items/:itemId')
  async removeItemFromCart(@Param('itemId') itemId: string) {
    return this.cartService.removeItemFromCart(itemId);
  }

  @Delete()
  async clearCart(@Body('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
