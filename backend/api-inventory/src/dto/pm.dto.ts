export class Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}


// src/products/dto/create-product.dto.ts
export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}
