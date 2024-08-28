import { Module } from '@nestjs/common';
import { ShippingController } from './sm.controller';
import { ShippingService } from './sm.service';
import { PrismaService } from 'src/prisma/prisma.service';


@Module({
  imports: [],
  controllers: [ShippingController],
  providers: [ShippingService,PrismaService],
})
export class SmModule {}
