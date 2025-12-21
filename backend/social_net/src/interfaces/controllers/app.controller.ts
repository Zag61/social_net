import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from 'src/application/services/app.service';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('authenticated')
  getAuthenticatedHello(): string {
    return this.appService.getAuthenticatedHello();
  }
}
