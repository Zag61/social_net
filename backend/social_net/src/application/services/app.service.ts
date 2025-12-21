import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getAuthenticatedHello(): string {
    return 'Hello World1!';
  }
}
