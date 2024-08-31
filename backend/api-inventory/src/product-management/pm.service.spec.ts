import { Test, TestingModule } from '@nestjs/testing';
import { PmService } from './pm.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, NotFoundException, BadGatewayException } from '@nestjs/common';
import { CreateProductDto, Product } from 'src/dto/pm.dto';

describe('PmService', () => {
    let service: PmService;
    let prismaService: PrismaService;

    const mockPrismaService = {
        product: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PmService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<PmService>(PmService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    describe('create', () => {
        it('should throw BadRequestException if no data is provided', async () => {
            await expect(service.create(null)).rejects.toThrow(BadRequestException);
        });

        it('should create a product and return success message', async () => {
            const createProductDto: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = { name: 'testUser', description: 'I am a test User', price: 123, imageUrl: 'funnyCat.jpg' };
            const newProduct: Product = { id: 'productId', createdAt: new Date(), updatedAt: new Date(), ...createProductDto };
            jest.spyOn(prismaService.product, 'create').mockResolvedValue(newProduct);

            const result = await service.create(createProductDto);
            expect(result).toEqual({
                success: true,
                message: 'product created successfully',
                data: newProduct,
            });
        });

        // it('should throw BadRequestException if product creation fails', async () => {
        //     const createProductDto: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = { name: 'testUser', description: 'I am a test User', price: 123, imageUrl: 'funnyCat.jpg' };
        //     jest.spyOn(prismaService.product, 'create').mockRejectedValue(new Error('Creation failed'));

        //     await expect(service.create(createProductDto)).rejects.toThrow(BadRequestException);
        // });
    });

    describe('findAllProducts', () => {
        it('should return an empty array if no products are found', async () => {
            jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([]);
            const result = await service.findAllProducts();
            expect(result).toEqual({
                success: true,
                message: 'all products returned successfully',
                data: [],
            });
        });

        it('should return a list of products', async () => {
            const products = [{ id: 'productId', createdAt: new Date(), updatedAt: new Date(), name: 'test', description: 'test-description', price: 123, imageUrl: 'funny-cat.jpg' }];
            jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(products);
            const result = await service.findAllProducts();
            expect(result).toEqual({
                success: true,
                message: 'all products returned successfully',
                data: products,
            });
        });

        it('should throw BadRequestException if products are not found', async () => {
            jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(null);
            await expect(service.findAllProducts()).rejects.toThrow(BadRequestException);
        });
    });

    describe('findOne', () => {
        it('should throw BadRequestException if no ID is provided', async () => {
            await expect(service.findOne(null)).rejects.toThrow(BadRequestException);
        });

        // it('should throw NotFoundException if the product is not found', async () => {
        //     jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(null);
        //     await expect(service.findOne('productId')).rejects.toThrow(NotFoundException);
        // });

        it('should return the product details', async () => {
            //  '{ id: string; createdAt: Date; updatedAt: Date; name: string; description: string; price: number; imageUrl: string; }
            const product = { id: 'productId', createdAt: new Date(), updatedAt: new Date(), name: 'test', description: 'test-description', price: 123, imageUrl: 'funny-cat.jpg' };
            jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(product);
            const result = await service.findOne('productId');
            expect(result).toEqual({
                success: true,
                message: 'product details updated successfully',
                data: product,
            });
        });
    });

    describe('update', () => {
        it('should throw BadRequestException if no ID or update data is provided', async () => {
            await expect(service.update(null, null)).rejects.toThrow(BadRequestException);
        });

        // it('should throw BadGatewayException if the product does not exist', async () => {
        //     jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(null);
        //     await expect(service.update('productId', { /* update data */ })).rejects.toThrow(BadGatewayException);
        // });

        it('should update the product and return success message', async () => {
            const product = { id: 'productId', createdAt: new Date(), updatedAt: new Date(), name: 'test', description: 'test-description', price: 123, imageUrl: 'funny-cat.jpg' };
            const updateData = { name: 'Updated Product', ...product };
            const updatedProduct = { ...product, ...updateData, updatedAt: new Date() };
            jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(product);
            jest.spyOn(prismaService.product, 'update').mockResolvedValue(updatedProduct);

            const result = await service.update('productId', updateData);
            expect(result).toEqual({
                success: true,
                message: 'product details updated successfully',
                data: updatedProduct,
            });
        });

        // it('should throw BadRequestException if update fails', async () => {
        //     const updateData = { name: 'Updated Product' };
        //     jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue({ id: 'productId', createdAt: new Date(), updatedAt: new Date(), name: 'testUser', description: 'hi test user', price: 1231, imageUrl: 'funny-cat.jpg' });
        //     jest.spyOn(prismaService.product, 'update').mockRejectedValue(new Error('Update failed'));

        //     await expect(service.update('productId', updateData)).rejects.toThrow(BadRequestException);
        // });
    });

    describe('remove', () => {
        it('should throw BadRequestException if no ID is provided', async () => {
            await expect(service.remove(null)).rejects.toThrow(BadRequestException);
        });

        // it('should throw BadGatewayException if the product does not exist', async () => {
        //     jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(null);
        //     await expect(service.remove('productId')).rejects.toThrow(BadGatewayException);
        // });

        it('should remove the product and return success message', async () => {
            jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue({ id: 'productId', createdAt: new Date(), updatedAt: new Date(), name: 'testUser', description: 'hi test user', price: 1231, imageUrl: 'funny-cat.jpg' });
            jest.spyOn(prismaService.product, 'delete').mockResolvedValue(undefined);

            const result = await service.remove('productId');
            expect(result).toEqual({
                success: true,
                message: 'product deleted successfully',
            });
        });

        // it('should throw BadRequestException if removal fails', async () => {
        //     jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue({ id: 'productId', createdAt: new Date(), updatedAt: new Date(), name: 'testUser', description: 'hi test user', price: 1231, imageUrl: 'funny-cat.jpg' });
        //     jest.spyOn(prismaService.product, 'delete').mockRejectedValue(new Error('Deletion failed'));

        //     await expect(service.remove('productId')).rejects.toThrow(BadRequestException);
        // });
    });
});
