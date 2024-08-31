import { Test, TestingModule } from '@nestjs/testing';
import { CreateCartDto, AddItemToCartDto, UpdateCartItemDto } from 'src/dto/cm.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cm.service';
import { PrismaService } from 'src/prisma/prisma.service';


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
        it('should throw BadRequestException if validation fails', async () => {
            const createCartDto: CreateCartDto = { userId: '' };
            await expect(service.createCart(createCartDto)).rejects.toThrow(BadRequestException);
        });

        it('should create a cart', async () => {
            const createCartDto: CreateCartDto = { userId: '12345' };
            const cart = { id: 'uuid', userId: '12345', createdAt: new Date(), updatedAt: new Date() };

            jest.spyOn(prismaService.cart, 'create').mockResolvedValue(cart);
            expect(await service.createCart(createCartDto)).toEqual(cart);
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
        it('should throw BadRequestException if validation fails', async () => {
            const addItemToCartDto: AddItemToCartDto = { productId: '', quantity: 1 };
            await expect(service.addItemToCart('userId', addItemToCartDto)).rejects.toThrow(BadRequestException);
        });

        it('should add an item to the cart', async () => {
            const addItemToCartDto: AddItemToCartDto = { productId: 'p123', quantity: 1 };
            const cart = {id: "string", cartId: "string", productId: "string", quantity: 123};
            const item = { id: 'item123', cartId: 'cart123', productId: 'p123', quantity: 1 };

            // jest.spyOn(service, 'getCart').mockResolvedValue(cart);
            jest.spyOn(prismaService.cartItem, 'create').mockResolvedValue(item);

            expect(await service.addItemToCart('userId', addItemToCartDto)).toEqual(item);
        });
    });

    describe('updateCartItem', () => {
        it('should throw BadRequestException if validation fails', async () => {
            const updateCartItemDto: UpdateCartItemDto = { quantity: 0 };
            await expect(service.updateCartItem('itemId', updateCartItemDto)).rejects.toThrow(BadRequestException);
        });

        it('should update the cart item', async () => {
            const updateCartItemDto: UpdateCartItemDto = { quantity: 2 };
            const item = { id: "string",cartId: "string", productId: "string", quantity: 123 };

            jest.spyOn(prismaService.cartItem, 'update').mockResolvedValue(item);
            expect(await service.updateCartItem('item123', updateCartItemDto)).toEqual(item);
        });

        it('should throw NotFoundException if item not found', async () => {
            jest.spyOn(prismaService.cartItem, 'update').mockResolvedValue(null);
            await expect(service.updateCartItem('invalidItemId', { quantity: 1 })).rejects.toThrow(NotFoundException);
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
        it('should throw BadRequestException if userId is missing', async () => {
            await expect(service.clearCart('')).rejects.toThrow(BadRequestException);
        });

        it('should clear the cart', async () => {
            
            const cart = { id: 'uuid', userId: '12345', createdAt: new Date(), updatedAt: new Date() };

            // jest.spyOn(service, 'getCart').mockResolvedValue(cart);
            jest.spyOn(prismaService.cartItem, 'deleteMany').mockResolvedValue({ count: 1 });

            expect(await service.clearCart("userId"))
        });
    })
})
