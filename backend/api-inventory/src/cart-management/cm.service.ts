import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { randomUUID } from 'crypto';
import { AddItemToCartDto, CreateCartDto, UpdateCartItemDto } from 'src/dto/cm.dto';

@Injectable()
export class CartService {
  constructor(private readonly prismaService: PrismaService) {}

  async createCart(createCartDto: CreateCartDto) {
    if(!createCartDto){
      throw new BadRequestException({
        success : false,
        message : 'cart does not created'
      })
    }
    console.log(createCartDto, " req aa gyi service me")
    const cart = await this.prismaService.cart.create({
      data: {
        id: randomUUID(),
        userId: createCartDto.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.prismaService.cart.findUnique({
      where: { id : userId },
      include: { items: true },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  async addItemToCart(userId: string, addItemToCartDto: AddItemToCartDto) {
    const cart = await this.getCart(userId);
    const item = await this.prismaService.cartItem.create({
      data: {
        id: randomUUID(),
        cartId: cart.id,
        productId: addItemToCartDto.productId,
        quantity: addItemToCartDto.quantity,
      },
    });
    return item;
  }

  async updateCartItem(itemId: string, updateCartItemDto: UpdateCartItemDto) {
    const item = await this.prismaService.cartItem.update({
      where: { id: itemId },
      data: { quantity: updateCartItemDto.quantity },
    });
    return item;
  }

  async removeItemFromCart(itemId: string) {
    await this.prismaService.cartItem.delete({
      where: { id: itemId },
    });
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    const cart = await this.getCart(userId);
    await this.prismaService.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    return { message: 'Cart cleared' };
  }
}
