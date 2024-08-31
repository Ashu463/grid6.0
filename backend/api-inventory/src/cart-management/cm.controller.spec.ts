import { Test, TestingModule } from '@nestjs/testing';

import { CreateCartDto, AddItemToCartDto, UpdateCartItemDto } from 'src/dto/cm.dto';
import { CartController } from './cm.controller';
import { CartService } from './cm.service';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            createCart: jest.fn(),
            getCart: jest.fn(),
            addItemToCart: jest.fn(),
            updateCartItem: jest.fn(),
            removeItemFromCart: jest.fn(),
            clearCart: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCart', () => {
    it('should call CartService.createCart with correct parameters', async () => {
      const createCartDto: CreateCartDto = { userId: '12345' };
      await controller.createCart(createCartDto);
      expect(service.createCart).toHaveBeenCalledWith(createCartDto);
    });
  });

  describe('getCart', () => {
    it('should call CartService.getCart with correct parameters', async () => {
      const userId = '12345';
      await controller.getCart(userId);
      expect(service.getCart).toHaveBeenCalledWith(userId);
    });
  });

  describe('addItemToCart', () => {
    it('should call CartService.addItemToCart with correct parameters', async () => {
      const userId = '12345';
      const addItemToCartDto: AddItemToCartDto = { productId: 'p123', quantity: 1 };
      await controller.addItemToCart(userId, addItemToCartDto);
      expect(service.addItemToCart).toHaveBeenCalledWith(userId, addItemToCartDto);
    });
  });

  describe('updateCartItem', () => {
    it('should call CartService.updateCartItem with correct parameters', async () => {
      const itemId = 'item123';
      const updateCartItemDto: UpdateCartItemDto = { quantity: 2 };
      await controller.updateCartItem(itemId, updateCartItemDto);
      expect(service.updateCartItem).toHaveBeenCalledWith(itemId, updateCartItemDto);
    });
  });

  describe('removeItemFromCart', () => {
    it('should call CartService.removeItemFromCart with correct parameters', async () => {
      const itemId = 'item123';
      await controller.removeItemFromCart(itemId);
      expect(service.removeItemFromCart).toHaveBeenCalledWith(itemId);
    });
  });

  describe('clearCart', () => {
    it('should call CartService.clearCart with correct parameters', async () => {
      const userId = '12345';
      await controller.clearCart(userId);
      expect(service.clearCart).toHaveBeenCalledWith(userId);
    });
  });
});
