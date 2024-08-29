import { ApiProperty } from '@nestjs/swagger';

export class Product {
  @ApiProperty({ description: 'The unique ID of the product' })
  id: string;

  @ApiProperty({ description: 'The name of the product' })
  name: string;

  @ApiProperty({ description: 'A brief description of the product' })
  description: string;

  @ApiProperty({ description: 'The price of the product', example: 99.99 })
  price: number;

  @ApiProperty({ description: 'The URL of the product image' })
  imageUrl: string;

  @ApiProperty({ description: 'The date the product was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date the product was last updated' })
  updatedAt: Date;
}

export class CreateProductDto {
  @ApiProperty({ description: 'The name of the product' })
  name: string;

  @ApiProperty({ description: 'A brief description of the product' })
  description: string;

  @ApiProperty({ description: 'The price of the product', example: 99.99 })
  price: number;

  @ApiProperty({ description: 'The URL of the product image' })
  imageUrl: string;
}
