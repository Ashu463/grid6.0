import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('/auth/register')
  register() : any{
    return this.appService.getlello()
  }
  @Get('test-connection')
  async testConnection() {
    const result = await this.appService.testConnection();
    return result;
  }
}
