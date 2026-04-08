import { Injectable, BadRequestException, NotFoundException, BadGatewayException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { AddItemToCartDto, CreateCartDto, getCartDTO, UpdateCartItemDto } from '../dto/cm.dto';
import { validateOrReject } from 'class-validator';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

@Injectable()
export class CartService {
  constructor(private readonly prismaService: PrismaService) {}
 
  async createCart(createCartDto: CreateCartDto): Promise<UniversalResponseDTO> {
    try {
      await validateOrReject(createCartDto);
    } catch {
      throw new BadRequestException({ success: false, message: 'Validation failed' });
    }
 
    const cart = await this.prismaService.cart.create({
      data: {
        id: randomUUID(),
        userId: createCartDto.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return { success: true, message: 'Cart created successfully', data: cart };
  }
 
  async getCart(data: getCartDTO, requestingUserId: string): Promise<UniversalResponseDTO> {
    // A01 — Broken Access Control: caller must own the cart
    if (data.userId !== requestingUserId) {
      // logSecurityEvent('CART_UNAUTHORIZED_ACCESS', { requestingUserId, cartUserId: data.userId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    const cart = await this.prismaService.cart.findUnique({
      where: { id: data.id, userId: data.userId },
    });
 
    if (!cart) {
      throw new NotFoundException({ success: false, message: 'Cart not found' });
    }
    return { success: true, message: 'Cart retrieved successfully', data: cart };
  }
 
  async addItemToCart(
    addItemToCartDto: AddItemToCartDto,
    requestingUserId: string,
  ): Promise<UniversalResponseDTO> {
    try {
      await validateOrReject(addItemToCartDto);
    } catch {
      throw new BadRequestException({ success: false, message: 'Validation failed' });
    }
 
    // A01 — verify the cart belongs to the authenticated user
    if (addItemToCartDto.userId !== requestingUserId) {
      // logSecurityEvent('CART_ITEM_UNAUTHORIZED', { requestingUserId, dtoUserId: addItemToCartDto.userId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    const cart = await this.prismaService.cart.findUnique({
      where: { id: addItemToCartDto.id, userId: addItemToCartDto.userId },
    });
 
    if (!cart) {
      throw new NotFoundException({ success: false, message: 'Cart not found' });
    }
 
    // BUG FIX — was reusing addItemToCartDto.id as the CartItem id
    const res = await this.prismaService.cartItem.create({
      data: {
        id: randomUUID(),  // ← generate a new unique id
        cartId: cart.id,
        productId: addItemToCartDto.productId,
        quantity: addItemToCartDto.quantity,
      },
    });
    return { success: true, message: 'Item added to cart', data: res };
  }
 
  async updateCartItem(
    itemId: string,
    updateCartItemDto: UpdateCartItemDto,
    requestingUserId: string,
  ): Promise<UniversalResponseDTO> {
    try {
      await validateOrReject(updateCartItemDto);
    } catch {
      throw new BadRequestException({ success: false, message: 'Validation failed' });
    }
 
    // A01 — fetch first, verify ownership, then mutate
    const existing = await this.prismaService.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
 
    if (!existing) {
      throw new NotFoundException({ success: false, message: 'Cart item not found' });
    }
 
    if (existing.cart.userId !== requestingUserId) {
      // logSecurityEvent('CART_ITEM_UPDATE_UNAUTHORIZED', { requestingUserId, itemId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    const item = await this.prismaService.cartItem.update({
      where: { id: itemId },
      data: { quantity: updateCartItemDto.quantity },
    });
    return { success: true, message: 'Cart item updated successfully', data: item };
  }
 
  async removeItemFromCart(itemId: string, requestingUserId: string): Promise<UniversalResponseDTO> {
    if (!itemId) {
      throw new BadRequestException({ success: false, message: 'Item ID is required' });
    }
 
    // A01 — ownership check before delete
    const existing = await this.prismaService.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
 
    if (!existing) {
      throw new NotFoundException({ success: false, message: 'Cart item not found' });
    }
 
    if (existing.cart.userId !== requestingUserId) {
      // logSecurityEvent('CART_ITEM_DELETE_UNAUTHORIZED', { requestingUserId, itemId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    await this.prismaService.cartItem.delete({ where: { id: itemId } });
    return { success: true, message: 'Item removed from cart' };
  }
 
  async clearCart(cartId: string, requestingUserId: string): Promise<UniversalResponseDTO> {
    if (!cartId) {
      throw new BadRequestException({ success: false, message: 'Cart ID is required' });
    }
 
    const cart = await this.prismaService.cart.findUnique({ where: { id: cartId } });
 
    if (!cart) {
      throw new NotFoundException({ success: false, message: 'Cart not found' });
    }
 
    // A01 — only the cart owner can clear it
    if (cart.userId !== requestingUserId) {
      // logSecurityEvent('CART_CLEAR_UNAUTHORIZED', { requestingUserId, cartId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    await this.prismaService.cart.delete({ where: { id: cartId } });
    return { success: true, message: 'Cart cleared' };
  }
}