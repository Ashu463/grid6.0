import { Module } from '@nestjs/common';
import { UmService } from './um.service';
import { UmController } from './um.controller';
import { PrismaService } from 'src/prisma/prisma.service';
@Module({
  imports: [],
  controllers: [UmController],
  providers: [UmService, PrismaService],
})
export class UmModule {}
