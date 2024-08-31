import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { PmService } from './pm.service';
import { Product } from 'src/dto/pm.dto';

@ApiTags('products')
@Controller('products')
export class PmController {
  constructor(private readonly pmService: PmService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: Product, description: 'Data for creating a new product, excluding id, createdAt, and updatedAt' })
  @ApiResponse({ status: 201, description: 'The product has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createProductDto: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.pmService.create(createProductDto);
  }

  @Get('/')
  @ApiOperation({ summary: 'Retrieve all products' })
  @ApiResponse({ status: 200, description: 'List of all products retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No products found' })
  async findAll() {
    return this.pmService.findAllProducts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single product by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the product to retrieve' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.pmService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the product to update' })
  @ApiBody({ description: 'Updated product data' })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(@Param('id') id: string, @Body() updateProductDto) {
    return this.pmService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the product to delete' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    return this.pmService.remove(id);
  }
}
