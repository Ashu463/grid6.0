import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Body('name') name : string) {
    return this.appService.getHello(name);
  }
  @Post('/auth/register')
  register() : any{
    return this.appService.getlello()
  }
}
