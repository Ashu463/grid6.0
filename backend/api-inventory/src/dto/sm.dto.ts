import { ApiProperty } from '@nestjs/swagger';

export class EstimateShippingDto {
  @ApiProperty({ description: 'The destination address for the shipment' })
  destination: string;

  @ApiProperty({ description: 'The weight of the package', example: 5.5 })
  weight: number;

  @ApiProperty({
    description: 'The dimensions of the package (length, width, height)',
    example: { length: 10, width: 15, height: 5 },
  })
  dimensions: { length: number; width: number; height: number };
}
