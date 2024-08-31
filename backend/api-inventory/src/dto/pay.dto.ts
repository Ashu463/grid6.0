import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'The ID of the order being paid for' })
  orderId: string;

  @ApiProperty({ description: 'The amount to be paid', example: 100.00 })
  amount: number;

  @ApiProperty({ description: 'The method of payment', example: 'Credit Card' })
  paymentMethod: string;

  @ApiProperty({ description: 'The ID of the user making the payment' })
  userId: string;
}

export class RefundPaymentDto {
  @ApiProperty({ description: 'The ID of the payment to be refunded' })
  paymentId: string;

  @ApiProperty({ description: 'The amount to be refunded', example: 50.00 })
  refundAmount: number;
}

export class PaymentIdDto {
  @ApiProperty({ description: 'The ID of the payment' })
  paymentId: string;
}
