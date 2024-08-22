import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma : PrismaService){}
  getHello(): string {
    return 'Hello World!';

  }
  async testConnection() {
    const result = await this.prisma.$queryRaw`SELECT 1;`;
    return { success: true, result };
  }
  getlello(): string {
    return 'Hello World!';
  }
}
