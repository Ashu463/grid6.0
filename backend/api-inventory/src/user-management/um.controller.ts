import { Controller, Get, Post } from '@nestjs/common';
import { UmService } from './um.service';

@Controller()
export class UmController {
  constructor(private readonly umservice : UmService) {}

  @Post('/auth/register')
  getRegistered(){
    
  }
}
