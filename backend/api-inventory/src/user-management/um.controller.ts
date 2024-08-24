import { Controller, Get, Post } from '@nestjs/common';
import { UmService } from './um.service';

@Controller('user')
export class UmController {
  constructor(private readonly umservice : UmService) {}

  @Get('/getuser')
  async getRegistered(){
    console.log("##################")
    return this.umservice.GetUsers();
  }
}
