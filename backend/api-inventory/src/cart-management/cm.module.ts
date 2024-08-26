import { Module } from '@nestjs/common';
import { CartController } from './cm.controller';
import { CartService } from './cm.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [CartController],
  providers: [CartService, PrismaService],
})
export class CartModule {}
