import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from 'prisma/prisma.service';
import { PmService } from './product-management/pm.service';
import { PmModule } from './product-management/pm.module';

@Module({
  imports: [PmModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
