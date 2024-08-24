import { Module } from '@nestjs/common';
import { PmService } from './pm.service';
import { PmController } from './pm.controller';
import { PrismaService } from 'src/prisma/prisma.service';
@Module({
  imports: [],
  controllers: [PmController],
  providers: [PmService, PrismaService],
})
export class PmModule {}
