import { BadGatewayException, BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from 'src/dto/cam.dto';
import { randomUUID } from 'crypto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

@Injectable()
export class CategoriesService {
  private readonly logger: Logger;
  constructor(private prismaService: PrismaService) {
    this.logger = new Logger(CategoriesService.name);
  }
 
  async create(data: CreateCategoryDto): Promise<UniversalResponseDTO> {
    if (!data) {
      throw new BadRequestException({ success: false, message: 'Incomplete data' });
    }
    try {
      const res = await this.prismaService.category.create({
        data: {
          id: randomUUID(),
          name: data.name,
          description: data.description,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return { success: true, message: 'Category created successfully', data: res };
    } catch (error) {
      // A05 — never leak raw DB error to the client
      this.logger.error('Category create failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
 
  async findAll(): Promise<UniversalResponseDTO> {
    try {
      // findMany always returns an array (never null) — no !res check needed
      const res = await this.prismaService.category.findMany();
      return { success: true, message: 'Categories retrieved successfully', data: res };
    } catch (error) {
      this.logger.error('Category findAll failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
 
  async findOne(id: string): Promise<UniversalResponseDTO> {
    if (!id) {
      throw new BadRequestException({ success: false, message: 'ID is required' });
    }
    try {
      const res = await this.prismaService.category.findUnique({ where: { id } });
      if (!res) {
        throw new NotFoundException({ success: false, message: 'Category not found' });
      }
      return { success: true, message: 'Category found successfully', data: res };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Category findOne failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
 
  async update(id: string, data: UpdateCategoryDto): Promise<UniversalResponseDTO> {
    if (!data || !id) {
      throw new BadRequestException({ success: false, message: 'ID and data are required' });
    }
    try {
      // A04 — verify existence before mutating
      const existing = await this.prismaService.category.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException({ success: false, message: 'Category not found' });
      }
      const res = await this.prismaService.category.update({ where: { id }, data });
      return { success: true, message: 'Category updated successfully', data: res };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Category update failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
 
  async remove(id: string): Promise<UniversalResponseDTO> {
    if (!id) {
      throw new BadRequestException({ success: false, message: 'ID is required' });
    }
    try {
      const existing = await this.prismaService.category.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException({ success: false, message: 'Category not found' });
      }
      const res = await this.prismaService.category.delete({ where: { id } });
      return { success: true, message: 'Category deleted successfully', data: res };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Category remove failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
}