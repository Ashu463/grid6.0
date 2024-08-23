import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PmModule } from './product-management/pm.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [PmModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
