import { Controller, Request, UseGuards, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'
/*import { LocalAuthGuard } from './auth/local-auth.guard'*/

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  get() {
    return this.appService.get()
  }

  /*@UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return req.user
  }*/
}
