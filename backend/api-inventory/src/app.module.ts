import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PmModule } from './product-management/pm.module';
import { UmModule } from './user-management/um.module';
import { PrismaService } from './prisma/prisma.service';
import { SmModule } from './shipping-management/sm.module';

import { PayModule } from './payment-processing/pay.module';

@Module({

  imports: [PmModule, UmModule ,SmModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
