import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PmService } from './pm.service';
import { Product } from 'src/dto/pm.dto';

@Controller('products')
export class PmController {
  constructor(private readonly pmService : PmService, ) {}

  
  @Post('/')
  async create(@Body() createProductDto: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.pmService.create(createProductDto);
  }
  @Get('/')
  async findAll() {
    return this.pmService.findAllProducts();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pmService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto) {
    return this.pmService.update(id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.pmService.remove(id);
  }
}
