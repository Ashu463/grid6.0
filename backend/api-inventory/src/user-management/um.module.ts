import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UserController } from './um.controller';
import { UserService } from './um.service';
import { AuthModule } from '../auth/auth.module';
import { GoogleStrategy } from './strategy/googlesStrategy';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, PrismaService, GoogleStrategy],
})
export class UserModule {}
