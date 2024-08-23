import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PmService } from './pm.service';
import { Product } from 'src/dto/pm.dto';

@Controller('products')
export class PmController {
  constructor(private readonly pmService : PmService, ) {}

  @Post('/auth/register')
  getRegistered(){
    
  }
  @Post()
  create(@Body() createProductDto: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    return this.pmService.create(createProductDto);
  }
  findAll(): Product[] {
    return this.pmService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Product {
    return this.pmService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Product {
    return this.pmService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): void {
    this.pmService.remove(id);
  }
}
