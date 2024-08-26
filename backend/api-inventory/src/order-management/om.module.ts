// src/order/order.module.ts

import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { OrderService } from './om.service';
import { OrderController } from './om.controller';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService],
})
export class OrderModule {}
