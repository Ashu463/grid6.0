// src/dto/order.dto.ts

export class CreateOrderDto {
    items: string[];
    userId: string;
    totalAmount: number;
  }
  
  export class UpdateOrderStatusDto {
    status: string;
  }
  