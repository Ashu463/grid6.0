import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { DoesNotEndWithHyphen } from 'src/utils/hyphen';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics', description: 'The name of the category' })
  @IsString()
  @DoesNotEndWithHyphen({ message: 'Name should not end with a hyphen.' })
  name: string;

  @ApiPropertyOptional({ example: 'Devices and gadgets', description: 'A brief description of the category' })
  @IsString()
  @DoesNotEndWithHyphen({ message: 'Description should not end with a hyphen.' })
  description?: string;
}

export class UpdateCategoryDto {
  @IsString()
  @DoesNotEndWithHyphen({ message: 'Name should not end with a hyphen.' })
  @ApiPropertyOptional({ example: 'Electronics', description: 'The name of the category' })
  name?: string;

  @IsString()
  @DoesNotEndWithHyphen({ message: 'Description should not end with a hyphen.' })
  @ApiPropertyOptional({ example: 'Devices and gadgets', description: 'A brief description of the category' })
  description?: string;
}
