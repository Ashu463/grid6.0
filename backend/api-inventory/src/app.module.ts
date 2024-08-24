import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PmModule } from './product-management/pm.module';
import { UmModule } from './user-management/um.module';
import { PrismaService } from './prisma/prisma.service';
import { CartModule } from './cart-management/cm.module';

@Module({
  imports: [PmModule, UmModule, CartModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
