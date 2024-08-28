// payment.dto.ts
export class CreatePaymentDto {
    orderId: string;
    amount: number;
    paymentMethod: string; // e.g., 'credit_card', 'paypal'
    userId: string;
  }
  
  export class RefundPaymentDto {
    paymentId: string;
    refundAmount: number; // Partial refunds may require an amount
  }
  
  export class PaymentIdDto {
    paymentId: string;
  }
  