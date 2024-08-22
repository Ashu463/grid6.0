import { Module } from '@nestjs/common';
import { UmService } from './um.service';
import { UmController } from './um.controller';
@Module({
  imports: [],
  controllers: [UmController],
  providers: [UmService],
})
export class AppModule {}
