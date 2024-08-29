import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'Array of item IDs in the order' })
  items: string[];

  @ApiProperty({ description: 'The ID of the user placing the order' })
  userId: string;

  @ApiProperty({ description: 'Total amount for the order', example: 100.00 })
  totalAmount: number;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'The new status of the order', example: 'Shipped' })
  status: string;
}
