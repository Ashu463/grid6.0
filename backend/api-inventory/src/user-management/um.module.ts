import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UserController } from './um.controller';
import { UserService } from './um.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
