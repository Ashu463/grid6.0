import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UserController } from './um.controller';
import { UserService } from './um.service';
import { JwtService } from '@nestjs/jwt';
import { GoogleStrategy } from './strategy/googlesStrategy';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtService, GoogleStrategy],
})
export class UserModule {}
