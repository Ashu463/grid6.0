import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { AddItemToCartDto, CreateCartDto, UpdateCartItemDto } from 'src/dto/cm.dto';
import { validateOrReject } from 'class-validator';

@Injectable()
export class CartService {
  constructor(private readonly prismaService: PrismaService) {}

  async createCart(createCartDto: CreateCartDto) {
    // Input validation
    try {
      await validateOrReject(createCartDto);
    } catch (errors) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    if (!createCartDto) {
      throw new BadRequestException({
        success: false,
        message: 'Cart creation failed',
      });
    }

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
    if (!userId) {
      throw new BadRequestException({
        success : false,
        message : 'User ID is required to retrieve the cart'
      });
    }

    const cart = await this.prismaService.cart.findUnique({
      where: { id: userId },
      include: { items: true },
    });
    if (!cart) {
      throw new NotFoundException({
        success : false,
        message : 'Cart not found'
      });
    }
    return cart;
  }

  async addItemToCart(userId: string, addItemToCartDto: AddItemToCartDto) {
    // Input validation
    try {
      await validateOrReject(addItemToCartDto);
    } catch (errors) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

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
    // Input validation
    try {
      await validateOrReject(updateCartItemDto);
    } catch (errors) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const item = await this.prismaService.cartItem.update({
      where: { id: itemId },
      data: { quantity: updateCartItemDto.quantity },
    });

    if (!item) {
      throw new NotFoundException({
        success : false,
        message : 'Cart item not found'
      });
    }

    return item;
  }

  async removeItemFromCart(itemId: string) {
    if (!itemId) {
      throw new BadRequestException({
        success : false ,
        message : 'Item ID is required'
      });
    }

    await this.prismaService.cartItem.delete({
      where: { id: itemId },
    });
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    if (!userId) {
      throw new BadRequestException({
        success : false,
        message : 'User ID is required to clear the cart'
      });
    }

    const cart = await this.getCart(userId);
    await this.prismaService.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    return { message: 'Cart cleared' };
  }
}