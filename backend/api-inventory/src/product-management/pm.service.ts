import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Product } from 'src/dto/pm.dto';

@Injectable()
export class PmService {
  getHello(): string {
    return 'Hello World!';
  }
  private products: Product[] = [];
  private idCounter = 1;

  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...product,
    };
    this.products.push(newProduct);
    return newProduct;
  }

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: string): Product {
    const product = this.products.find((prod) => prod.id === id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  update(id: string, updateData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Product {
    const product = this.findOne(id);
    const updatedProduct = { ...product, ...updateData, updatedAt: new Date() };
    this.products = this.products.map((prod) => (prod.id === id ? updatedProduct : prod));
    return updatedProduct;
  }

  remove(id: string): void {
    const product = this.findOne(id);
    this.products = this.products.filter((prod) => prod.id !== id);
  }
}
