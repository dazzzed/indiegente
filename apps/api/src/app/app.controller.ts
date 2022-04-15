import { Controller, Get, Query } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('indiegente')
  getEps(@Query('page') page) {
    return this.appService.getEps(page);
  }
}
