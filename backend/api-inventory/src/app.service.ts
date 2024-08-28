import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(){}
  getHello(name : string) {
    return {
      success : true, 
      message : `hello ${name} I am controller`
    }

  }
  getlello(): string {
    return 'Hello World!';
  }
}
