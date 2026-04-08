import { BadGatewayException, BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateProductDto, Product } from 'src/dto/pm.dto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PmService {
  private readonly logger: Logger;
  constructor(private readonly prismaService: PrismaService) {
    this.logger = new Logger(PmService.name);
  }
 
  async create(product: CreateProductDto): Promise<UniversalResponseDTO> {
    if (!product) {
      throw new BadRequestException({ success: false, message: 'Product data is required' });
    }
 
    const newProduct: Product = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...product,
    };
 
    // BUG FIX — create() was outside the try/catch; DB errors were previously unhandled
    try {
      const res = await this.prismaService.product.create({ data: newProduct });
      return { success: true, message: 'Product created successfully', data: res };
    } catch (error) {
      this.logger.error('Product create failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
 
  async findAllProducts(): Promise<UniversalResponseDTO> {
    try {
      // findMany always returns an array — !products check was incorrect
      const products = await this.prismaService.product.findMany();
      return { success: true, message: 'Products retrieved successfully', data: products };
    } catch (error) {
      this.logger.error('findAllProducts failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
 
  async findOne(id: string): Promise<UniversalResponseDTO> {
    if (!id) {
      throw new BadRequestException({ success: false, message: 'Product ID is required' });
    }
    try {
      const product = await this.prismaService.product.findUnique({ where: { id } });
      if (!product) {
        throw new NotFoundException({ success: false, message: 'Product not found' });
      }
      return { success: true, message: 'Product retrieved successfully', data: product };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('findOne failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
 
  async update(
    id: string,
    updateData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<UniversalResponseDTO> {
    if (!id || !updateData) {
      throw new BadRequestException({ success: false, message: 'ID and update data are required' });
    }
 
    try {
      // BUG FIX — was missing await; findUnique returned a Promise so null check was always truthy
      const product = await this.prismaService.product.findUnique({ where: { id } });
      if (!product) {
        throw new NotFoundException({ success: false, message: 'Product not found' });
      }
 
      const updated = await this.prismaService.product.update({
        where: { id },
        data: { ...updateData, updatedAt: new Date() },
      });
      return { success: true, message: 'Product updated successfully', data: updated };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Product update failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
 
  async remove(id: string): Promise<UniversalResponseDTO> {
    if (!id) {
      throw new BadRequestException({ success: false, message: 'Product ID is required' });
    }
 
    try {
      // BUG FIX — was missing await; null check was always truthy (checked the Promise object)
      const product = await this.prismaService.product.findUnique({ where: { id } });
      if (!product) {
        throw new NotFoundException({ success: false, message: 'Product not found' });
      }
 
      await this.prismaService.product.delete({ where: { id } });
      return { success: true, message: 'Product deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Product remove failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
}
 