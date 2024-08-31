import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PmModule } from './product-management/pm.module';

import { PrismaService } from './prisma/prisma.service';
import { ReviewModule } from './review-management/rm.module';

import { CategoriesModule } from './categories-management/cam.module';
import { UserModule } from './user-management/um.module';
import { CartModule } from './cart-management/cm.module';
import { OrderModule } from './order-management/om.module';
import { SmModule } from './shipping-management/sm.module';
import { PayModule } from './payment-processing/pay.module';

@Module({
  imports: [PmModule, UserModule, CartModule, OrderModule, SmModule, PayModule, CategoriesModule, ReviewModule],

  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
