import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PmService } from './pm.service';
import { Product } from 'src/dto/pm.dto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

@Controller('products')
export class PmController {
  constructor(private readonly pmService : PmService, ) {}

  
  @Post('/')
  async create(@Body() createProductDto: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>)  : Promise<UniversalResponseDTO> {
    return this.pmService.create(createProductDto);
  }
  @Get('/')
  async findAll() : Promise<UniversalResponseDTO>{
    return this.pmService.findAllProducts();
  }

  @Get(':id')
  async findOne(@Param('id') id: string)  : Promise<UniversalResponseDTO>{
    return this.pmService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto) : Promise<UniversalResponseDTO>{
    return this.pmService.update(id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) : Promise<UniversalResponseDTO> {
    return this.pmService.remove(id);
  }
}
