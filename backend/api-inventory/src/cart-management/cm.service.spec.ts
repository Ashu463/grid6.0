import { Test, TestingModule } from '@nestjs/testing';
import { CreateCartDto, AddItemToCartDto, UpdateCartItemDto } from 'src/dto/cm.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cm.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { validateOrReject } from 'class-validator';


describe('CartService', () => {
    let service: CartService;
    let prismaService: PrismaService;

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
                        },
                        cartItem: {
                            create: jest.fn(),
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
        // it('should throw BadRequestException if validation fails', async () => {
        //   // Mock validateOrReject to throw an error
        //   jest.spyOn(validateOrReject,'validate' ).mockRejectedValue();

        //   const createCartDto: CreateCartDto = { userId: '' };
        //   await expect(service.createCart(createCartDto)).rejects.toThrow(BadRequestException);
        // });
    
        it('should create a cart', async () => {
          const createCartDto: CreateCartDto = { userId: 'user123' };
          const createdCart = { id: 'cart123', userId: 'user123', createdAt: new Date(), updatedAt: new Date() };
    
          prismaService.cart.create = jest.fn().mockResolvedValue(createdCart);
    
          await expect(service.createCart(createCartDto)).resolves.toEqual(createdCart);
        });
      });

    describe('getCart', () => {
        it('should throw BadRequestException if userId is missing', async () => {
            await expect(service.getCart('')).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if cart not found', async () => {
            jest.spyOn(prismaService.cart, 'findUnique').mockResolvedValue(null);
            await expect(service.getCart('invalidUserId')).rejects.toThrow(NotFoundException);
        });

        it('should return the cart if found', async () => {
            const cart = { id: 'uuid', userId: '12345', createdAt: new Date(), updatedAt: new Date() };
            jest.spyOn(prismaService.cart, 'findUnique').mockResolvedValue(cart);
            expect(await service.getCart('12345')).toEqual(cart);
        });
    });

    describe('addItemToCart', () => {
        it('should throw NotFoundException if cart is not found', async () => {
          prismaService.cart.findUnique = jest.fn().mockResolvedValue(null);
    
          const addItemToCartDto: AddItemToCartDto = { productId: 'product123', quantity: 1 };
    
          await expect(service.addItemToCart('user123', addItemToCartDto)).rejects.toThrow(NotFoundException);
        });
    
        // it('should throw BadRequestException if validation fails', async () => {
        //   // Mock validateOrReject to throw an error
        //   (validateOrReject as jest.Mock).mockRejectedValue(new Error('Validation failed'));
    
        //   prismaService.cart.findUnique = jest.fn().mockResolvedValue({ id: 'cart123', userId: 'user123', items: [] });
    
        //   const addItemToCartDto: AddItemToCartDto = { productId: '', quantity: 1 };
        //   await expect(service.addItemToCart('user123', addItemToCartDto)).rejects.toThrow(BadRequestException);
        // });
    
        it('should add an item to the cart', async () => {
          const cart = { id: 'cart123', userId: 'user123', items: [] };
          const addedItem = { id: 'item123', cartId: 'cart123', productId: 'product123', quantity: 1 };
    
          prismaService.cart.findUnique = jest.fn().mockResolvedValue(cart);
          prismaService.cartItem.create = jest.fn().mockResolvedValue(addedItem);
    
          const addItemToCartDto: AddItemToCartDto = { productId: 'product123', quantity: 1 };
          await expect(service.addItemToCart('user123', addItemToCartDto)).resolves.toEqual(addedItem);
        });
      });

      describe('updateCartItem', () => {
        it('should throw NotFoundException if cart item is not found', async () => {
          prismaService.cartItem.update = jest.fn().mockResolvedValue(null);
    
          const updateCartItemDto: UpdateCartItemDto = { quantity: 2 };
    
          await expect(service.updateCartItem('item123', updateCartItemDto)).rejects.toThrow(NotFoundException);
        });
    
        // it('should throw BadRequestException if validation fails', async () => {
        //   // Mock validateOrReject to throw an error
        //   (validateOrReject as jest.Mock).mockRejectedValue(new Error('Validation failed'));
    
        //   const updateCartItemDto: UpdateCartItemDto = { quantity: 0 };
        //   await expect(service.updateCartItem('item123', updateCartItemDto)).rejects.toThrow(BadRequestException);
        // });
    
        it('should update the cart item', async () => {
          const updatedItem = { id: 'item123', cartId: 'cart123', productId: 'product123', quantity: 2 };
    
          prismaService.cartItem.update = jest.fn().mockResolvedValue(updatedItem);
    
          const updateCartItemDto: UpdateCartItemDto = { quantity: 2 };
          await expect(service.updateCartItem('item123', updateCartItemDto)).resolves.toEqual(updatedItem);
        });
      });

    describe('removeItemFromCart', () => {
        it('should throw BadRequestException if itemId is missing', async () => {
            await expect(service.removeItemFromCart('')).rejects.toThrow(BadRequestException);
        });

        it('should remove the item from the cart', async () => {
            // jest.spyOn(prismaService.cartItem, 'delete').mockResolvedValue({});

            expect(await service.removeItemFromCart('item123')).toEqual({ message: 'Item removed from cart' });
        });
    });

    describe('clearCart', () => {
        it('should throw NotFoundException if cart is not found', async () => {
          prismaService.cart.findUnique = jest.fn().mockResolvedValue(null);
    
          await expect(service.clearCart('user123')).rejects.toThrow(NotFoundException);
        });
    
        it('should clear the cart', async () => {
          const cart = { id: 'cart123', userId: 'user123', items: [] };
    
          prismaService.cart.findUnique = jest.fn().mockResolvedValue(cart);
          prismaService.cartItem.deleteMany = jest.fn().mockResolvedValue({});
    
          await expect(service.clearCart('user123')).resolves.toEqual({ message: 'Cart cleared' });
        });
      });
})
