import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './cam.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, BadGatewayException, InternalServerErrorException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from 'src/dto/cam.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const createCategoryDto: CreateCategoryDto = { name: 'New Category', description: 'A new category description' };
      const mockCategory = { id: 'categoryId',name: 'New Category', description: 'A new category description', createdAt: new Date(), updatedAt: new Date() };
    //   '{ id: string; name: string; description: string; createdAt: Date; updatedAt: Date; 
      jest.spyOn(prismaService.category, 'create').mockResolvedValue(mockCategory);

      const result = await service.create(createCategoryDto);

      expect(result).toEqual({
        success: true,
        message: 'category created successfully',
        data: mockCategory,
      });
    });

    it('should throw BadRequestException if data is not provided', async () => {
      await expect(service.create(null)).rejects.toThrow(BadRequestException);
    });

    it('should handle error during category creation', async () => {
      jest.spyOn(prismaService.category, 'create').mockRejectedValue(new Error());
      await expect(service.create({ name: 'New Category', description: 'A new category description' })).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [{ id: 'categoryId', name: 'Category 1', description: 'Description 1', createdAt: new Date(), updatedAt: new Date() }];
      jest.spyOn(prismaService.category, 'findMany').mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result).toEqual({
        success: true,
        message: 'category found successfully',
        data: mockCategories,
      });
    });

    it('should handle error during finding all categories', async () => {
      jest.spyOn(prismaService.category, 'findMany').mockRejectedValue(new Error());
      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return a category by ID', async () => {
      const mockCategory = { id: 'categoryId', name: 'Category 1', description: 'Description 1', createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(prismaService.category, 'findUnique').mockResolvedValue(mockCategory);

      const result = await service.findOne('categoryId');

      expect(result).toEqual({
        success: true,
        message: 'category found successfully',
        data: mockCategory,
      });
    });

    it('should throw BadRequestException if ID is not provided', async () => {
      await expect(service.findOne(null)).rejects.toThrow(BadRequestException);
    });

    it('should handle error during finding a category by ID', async () => {
      jest.spyOn(prismaService.category, 'findUnique').mockRejectedValue(new Error());
      await expect(service.findOne('categoryId')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category', description: 'An updated category description' };
      const mockCategory = { id: 'categoryId', name: 'Updated Category', description: 'An updated category description', createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(prismaService.category, 'update').mockResolvedValue(mockCategory);

      const result = await service.update('categoryId', updateCategoryDto);

      expect(result).toEqual({
        success: true,
        message: 'category updated successfully',
        data: mockCategory,
      });
    });

    it('should throw BadRequestException if data or ID is not provided', async () => {
      await expect(service.update(null, null)).rejects.toThrow(BadRequestException);
    });

    it('should handle error during category update', async () => {
      jest.spyOn(prismaService.category, 'update').mockRejectedValue(new Error());
      await expect(service.update('categoryId', { name: 'Updated Category', description: 'An updated category description' })).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should remove a category successfully', async () => {
      const mockCategory = { id: 'categoryId', name: 'Category 1', description: 'Description 1', createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(prismaService.category, 'delete').mockResolvedValue(mockCategory);

      const result = await service.remove('categoryId');

      expect(result).toEqual({
        success: true,
        message: 'category deleted successfully',
        data: mockCategory,
      });
    });

    it('should throw BadRequestException if ID is not provided', async () => {
      await expect(service.remove(null)).rejects.toThrow(BadRequestException);
    });

    it('should handle error during category removal', async () => {
      jest.spyOn(prismaService.category, 'delete').mockRejectedValue(new Error());
      await expect(service.remove('categoryId')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
