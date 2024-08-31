import { Test, TestingModule } from '@nestjs/testing';
import { PmController } from './pm.controller';
import { PmService } from './pm.service';
import { Product } from 'src/dto/pm.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PmController', () => {
  let controller: PmController;
  let service: PmService;

  const mockPmService = {
    create: jest.fn(),
    findAllProducts: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PmController],
      providers: [
        { provide: PmService, useValue: mockPmService },
      ],
    }).compile();

    controller = module.get<PmController>(PmController);
    service = module.get<PmService>(PmService);
  });

  describe('create', () => {
    it('should call PmService.create with the correct data', async () => {
      const createProductDto: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = { name : 'testUser', description : 'I am a test User', price : 123, imageUrl : 'funnyCat.jpg' };
      await controller.create(createProductDto);
      expect(service.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('findAll', () => {
    it('should call PmService.findAllProducts', async () => {
      await controller.findAll();
      expect(service.findAllProducts).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call PmService.findOne with the correct ID', async () => {
      const id = 'productId';
      await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should call PmService.update with the correct ID and data', async () => {
      const id = 'productId';
      const updateProductDto = { /* your data */ };
      await controller.update(id, updateProductDto);
      expect(service.update).toHaveBeenCalledWith(id, updateProductDto);
    });
  });

  describe('remove', () => {
    it('should call PmService.remove with the correct ID', async () => {
      const id = 'productId';
      await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
