// category.dto.ts

export class CreateCartDto {
  userId: string;
}

export class AddItemToCartDto {
  productId: string;
  quantity: number;
}

export class UpdateCartItemDto {
  quantity: number;
}

  