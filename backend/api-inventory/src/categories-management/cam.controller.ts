import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CategoriesService } from './cam.service';
import { CreateCategoryDto, UpdateCategoryDto } from 'src/dto/cam.dto';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

@ApiTags('Categories Management')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  @ApiBody({ type: CreateCategoryDto, description: 'Category data' })
  async create(@Body('data') createCategoryDto: CreateCategoryDto): Promise<UniversalResponseDTO> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Retrieved all categories.' })
  async findAll(): Promise<UniversalResponseDTO> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully.' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async findOne(@Param('id') id: string): Promise<UniversalResponseDTO> {
    return this.categoriesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiBody({ type: UpdateCategoryDto, description: 'Updated category data' })
  async update(
    @Param('id') id: string,
    @Body('data') updateCategoryDto: UpdateCategoryDto,
  ): Promise<UniversalResponseDTO> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully.' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async remove(@Param('id') id: string): Promise<UniversalResponseDTO> {
    return this.categoriesService.remove(id);
  }
}
