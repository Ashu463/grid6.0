import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics', description: 'The name of the category' })
  name: string;

  @ApiPropertyOptional({ example: 'Devices and gadgets', description: 'A brief description of the category' })
  description?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Electronics', description: 'The name of the category' })
  name?: string;

  @ApiPropertyOptional({ example: 'Devices and gadgets', description: 'A brief description of the category' })
  description?: string;
}
