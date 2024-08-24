import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UmService {
  constructor(private readonly prismaService : PrismaService){}
  
  async GetUsers() {
    console.log("get users called")
    const products = await this.prismaService.user.findMany();
    if (!products) {
      throw new BadRequestException({
        success: false,
        message: 'products not found'
      })
    }
    console.log(products, "--------------------")
    return {
      success: true,
      message: 'all products returned successfully',
      data: products
    };
  }
}
