import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({ description: 'The ID of the user creating the cart' })
  userId: string;
}

export class AddItemToCartDto {
  @ApiProperty({ description: 'The ID of the product to add to the cart' })
  productId: string;

  @ApiProperty({ description: 'The quantity of the product to add', example: 1 })
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'The new quantity of the product in the cart', example: 2 })
  quantity: number;
}
