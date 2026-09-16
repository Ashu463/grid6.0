import { Test, TestingModule } from '@nestjs/testing';

import { CreateCartDto, AddItemToCartDto, UpdateCartItemDto, getCartDTO } from 'src/dto/cm.dto';
import { CartController } from './cm.controller';
import { CartService } from './cm.service';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  const requestingUserId = 'test-user';

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
    it('should call CartService.getCart with the requesting user id', async () => {
      const data : getCartDTO = {userId : requestingUserId, id : 'test-id'};
      await controller.getCart(data, requestingUserId);
      expect(service.getCart).toHaveBeenCalledWith(data, requestingUserId);
    });
  });

  describe('addItemToCart', () => {
    it('should call CartService.addItemToCart with the requesting user id', async () => {
      const addItemToCartDto: AddItemToCartDto = { productId: 'p123', quantity: 1, userId: requestingUserId, id: 'testId' };

      await controller.addItemToCart(addItemToCartDto, requestingUserId);

      expect(service.addItemToCart).toHaveBeenCalledWith(addItemToCartDto, requestingUserId);
    });
  });

  describe('updateCartItem', () => {
    it('should call CartService.updateCartItem with the requesting user id', async () => {
      const itemId = 'item123';
      const updateCartItemDto: UpdateCartItemDto = { quantity: 2 };
      await controller.updateCartItem(itemId, updateCartItemDto, requestingUserId);
      expect(service.updateCartItem).toHaveBeenCalledWith(itemId, updateCartItemDto, requestingUserId);
    });
  });

  describe('removeItemFromCart', () => {
    it('should call CartService.removeItemFromCart with the requesting user id', async () => {
      const itemId = 'item123';
      await controller.removeItemFromCart(itemId, requestingUserId);
      expect(service.removeItemFromCart).toHaveBeenCalledWith(itemId, requestingUserId);
    });
  });

});
