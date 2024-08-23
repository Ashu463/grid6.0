import { Module } from '@nestjs/common';
import { PmService } from './pm.service';
import { PmController } from './pm.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [PmController],
  providers: [PmService],
})
export class PmModule {}
