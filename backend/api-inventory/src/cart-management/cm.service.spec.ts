import { Test, TestingModule } from '@nestjs/testing';
import { CreateCartDto, AddItemToCartDto, UpdateCartItemDto, getCartDTO } from 'src/dto/cm.dto';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CartService } from './cm.service';
import { PrismaService } from 'src/prisma/prisma.service';


describe('CartService', () => {
  let service: CartService;
  let prismaService: PrismaService;

  const requestingUserId = 'test-user';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: {
            cart: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
            cartItem: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCart', () => {
    it('should create a cart', async () => {
      const createCartDto: CreateCartDto = { userId: requestingUserId };
      const createdCart = { id: 'cart123', userId: requestingUserId, createdAt: new Date(), updatedAt: new Date() };

      jest.spyOn(prismaService.cart, 'create').mockResolvedValue(createdCart);

      const result = await service.createCart(createCartDto);
      expect(result).toEqual({ success: true, message: 'Cart created successfully', data: createdCart });
    });
  });

  describe('getCart', () => {
    it('should throw ForbiddenException if the cart does not belong to the requesting user (BOLA)', async () => {
      const data: getCartDTO = { userId: 'someoneElse', id: 'testId' };
      await expect(service.getCart(data, requestingUserId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if cart not found', async () => {
      const data: getCartDTO = { userId: requestingUserId, id: 'testId' };
      jest.spyOn(prismaService.cart, 'findUnique').mockResolvedValue(null);
      await expect(service.getCart(data, requestingUserId)).rejects.toThrow(NotFoundException);
    });

    it('should return the cart if found and owned by the requesting user', async () => {
      const data: getCartDTO = { userId: requestingUserId, id: 'cart123' };
      const cart = { id: 'cart123', userId: requestingUserId, createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(prismaService.cart, 'findUnique').mockResolvedValue(cart);

      const result = await service.getCart(data, requestingUserId);
      expect(result).toEqual({ success: true, message: 'Cart retrieved successfully', data: cart });
    });
  });

  describe('addItemToCart', () => {
    it('should throw ForbiddenException if the dto userId does not match the requesting user (BOLA)', async () => {
      const addItemToCartDto: AddItemToCartDto = { productId: 'product123', quantity: 1, userId: 'someoneElse', id: 'cart123' };
      await expect(service.addItemToCart(addItemToCartDto, requestingUserId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if cart is not found', async () => {
      jest.spyOn(prismaService.cart, 'findUnique').mockResolvedValue(null);

      const addItemToCartDto: AddItemToCartDto = { productId: 'product123', quantity: 1, userId: requestingUserId, id: 'cart123' };

      await expect(service.addItemToCart(addItemToCartDto, requestingUserId)).rejects.toThrow(NotFoundException);
    });

    it('should add an item to the cart', async () => {
      const cart = { id: 'cart123', userId: requestingUserId };
      const addedItem = { id: 'item123', cartId: 'cart123', productId: 'product123', quantity: 1 };

      jest.spyOn(prismaService.cart, 'findUnique').mockResolvedValue(cart as any);
      jest.spyOn(prismaService.cartItem, 'create').mockResolvedValue(addedItem as any);

      const addItemToCartDto: AddItemToCartDto = { productId: 'product123', quantity: 1, userId: requestingUserId, id: 'cart123' };
      const result = await service.addItemToCart(addItemToCartDto, requestingUserId);
      expect(result).toEqual({ success: true, message: 'Item added to cart', data: addedItem });
    });
  });

  describe('updateCartItem', () => {
    it('should throw NotFoundException if cart item is not found', async () => {
      jest.spyOn(prismaService.cartItem, 'findUnique').mockResolvedValue(null);

      const updateCartItemDto: UpdateCartItemDto = { quantity: 2 };

      await expect(service.updateCartItem('item123', updateCartItemDto, requestingUserId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if the cart item belongs to another user (BOLA)', async () => {
      jest.spyOn(prismaService.cartItem, 'findUnique').mockResolvedValue({
        id: 'item123',
        cartId: 'cart123',
        productId: 'product123',
        quantity: 1,
        cart: { id: 'cart123', userId: 'someoneElse' },
      } as any);

      const updateCartItemDto: UpdateCartItemDto = { quantity: 2 };

      await expect(service.updateCartItem('item123', updateCartItemDto, requestingUserId)).rejects.toThrow(ForbiddenException);
    });

    it('should update the cart item', async () => {
      jest.spyOn(prismaService.cartItem, 'findUnique').mockResolvedValue({
        id: 'item123',
        cartId: 'cart123',
        productId: 'product123',
        quantity: 1,
        cart: { id: 'cart123', userId: requestingUserId },
      } as any);
      const updatedItem = { id: 'item123', cartId: 'cart123', productId: 'product123', quantity: 2 };
      jest.spyOn(prismaService.cartItem, 'update').mockResolvedValue(updatedItem as any);

      const updateCartItemDto: UpdateCartItemDto = { quantity: 2 };
      const result = await service.updateCartItem('item123', updateCartItemDto, requestingUserId);
      expect(result).toEqual({ success: true, message: 'Cart item updated successfully', data: updatedItem });
    });
  });

  describe('removeItemFromCart', () => {
    it('should throw BadRequestException if itemId is missing', async () => {
      await expect(service.removeItemFromCart('', requestingUserId)).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if the cart item belongs to another user (BOLA)', async () => {
      jest.spyOn(prismaService.cartItem, 'findUnique').mockResolvedValue({
        id: 'item123',
        cartId: 'cart123',
        cart: { id: 'cart123', userId: 'someoneElse' },
      } as any);

      await expect(service.removeItemFromCart('item123', requestingUserId)).rejects.toThrow(ForbiddenException);
    });

    it('should remove the item from the cart', async () => {
      jest.spyOn(prismaService.cartItem, 'findUnique').mockResolvedValue({
        id: 'item123',
        cartId: 'cart123',
        cart: { id: 'cart123', userId: requestingUserId },
      } as any);
      jest.spyOn(prismaService.cartItem, 'delete').mockResolvedValue({} as any);

      const result = await service.removeItemFromCart('item123', requestingUserId);
      expect(result).toEqual({ success: true, message: 'Item removed from cart' });
    });
  });

  describe('clearCart', () => {
    it('should throw NotFoundException if cart is not found', async () => {
      jest.spyOn(prismaService.cart, 'findUnique').mockResolvedValue(null);

      await expect(service.clearCart('cart123', requestingUserId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if the cart belongs to another user (BOLA)', async () => {
      jest.spyOn(prismaService.cart, 'findUnique').mockResolvedValue({ id: 'cart123', userId: 'someoneElse' } as any);

      await expect(service.clearCart('cart123', requestingUserId)).rejects.toThrow(ForbiddenException);
    });

    it('should clear the cart', async () => {
      jest.spyOn(prismaService.cart, 'findUnique').mockResolvedValue({ id: 'cart123', userId: requestingUserId } as any);
      jest.spyOn(prismaService.cart, 'delete').mockResolvedValue({} as any);

      const result = await service.clearCart('cart123', requestingUserId);
      expect(result).toEqual({ success: true, message: 'Cart cleared' });
    });
  });
})
