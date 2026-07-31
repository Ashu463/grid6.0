import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('/health')
  getHealth() {
    console.log("hi to the cloud from health route")
    return 'hello cloud'
  }
  
  
}
