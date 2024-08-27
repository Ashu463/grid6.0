import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  getHello() {
    console.log("hi to the cloud from health route")
    return 'hello cloud'
  }
  @Post('/auth/register')
  register() : any{
    return this.appService.getlello()
  }
}
