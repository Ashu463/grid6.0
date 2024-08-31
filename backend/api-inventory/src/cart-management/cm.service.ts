import { Injectable, BadRequestException, NotFoundException, BadGatewayException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { AddItemToCartDto, CreateCartDto, getCartDTO, UpdateCartItemDto } from 'src/dto/cm.dto';
import { validateOrReject } from 'class-validator';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

@Injectable()
export class CartService {
  constructor(private readonly prismaService: PrismaService) {}

  async createCart(createCartDto: CreateCartDto): Promise<UniversalResponseDTO> {
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
    return{
      success : true,
      message : 'cart created successfully',
      data : cart
    };
  }

  async getCart(data: getCartDTO): Promise<UniversalResponseDTO> {
    if (!data) {
      throw new BadRequestException({
        success : false,
        message : 'User ID is required to retrieve the cart'
      });
    }
    const cart = await this.prismaService.cart.findUnique({
      where: {id : data.id, userId: data.userId },
    });
    if (!cart) {
      throw new NotFoundException({
        success : false,
        message : 'Cart not found'
      });
    }
    return{
      success : true,
      message : 'cart retrieved successfully',
      data : cart
    };
  }

  async addItemToCart(addItemToCartDto: AddItemToCartDto){
    // Input validation
    try {
      await validateOrReject(addItemToCartDto);
    } catch (errors) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed',
      });
    }
    
    const id = await this.prismaService.cart.findUnique({where : {id : addItemToCartDto.id, userId : addItemToCartDto.userId}})
    if(!id){
      throw new BadGatewayException({
        successs : false,
        message : 'user with such crednetials not found'
      })
    }
    const items = {
      id : addItemToCartDto.id,
      userId : addItemToCartDto.userId,
      
      createdAt : new Date(),
      updatedAt : new Date(),
    }
    const res = await this.prismaService.cartItem.create({ data : {
      id : addItemToCartDto.id,
      cartId: id.id,
      productId : addItemToCartDto.productId,
      quantity : addItemToCartDto.quantity
    }})
    if(!res){
      throw new BadGatewayException({
        success : false,
        message : 'error occured while adding items to cart'
      })
    }
    return {
      success : true,
      message : 'items added to cart',
      data : res
    }
  }

  async updateCartItem(itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<UniversalResponseDTO> {
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

    return{
      success : true,
      message : 'Updated cart item successfully',
      data : item
    };
  }

  async removeItemFromCart(itemId: string): Promise<UniversalResponseDTO>{
    if (!itemId) {
      throw new BadRequestException({
        success : false ,
        message : 'Item ID is required'
      });
    }

    await this.prismaService.cartItem.delete({
      where: { id: itemId },
    });
    return { 
      success : true,
      message: 'Item removed from cart' };
  }

  async clearCart(userId: string){
    if (!userId) {
      throw new BadRequestException({
        success : false,
        message : 'User ID is required to clear the cart'
      });
    }

    const cart = await this.prismaService.cart.findUnique({where : {id : userId}})
    if(!cart){
      throw new BadRequestException({
        success : false,
        message : 'cart does not exist'
      })
    }
    const res = await this.prismaService.cart.delete({where : {id : userId}})
    if(!res){
      throw new BadGatewayException({
        success : false,
        message : 'error while creating cart'
      })
    }
    return { 
      success: true,
      message: 'Cart cleared' 
    };
  }
}