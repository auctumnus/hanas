import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common'
import { SessionService } from './session.service'
import { CreateSessionDto } from './dto/create-session.dto'
import { UserService } from '../user/user.service'
import { UAParser } from 'ua-parser-js'
import { Request } from 'express'
import { RefreshSessionDto } from './dto/refresh-session.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { checkUser } from '../auth/checkUser'

@Controller()
export class SessionController {
  constructor(
    private sessionService: SessionService,
    private userService: UserService,
  ) {}

  @Post()
  async create(
    @Body() createSessionDto: CreateSessionDto,
    @Req() req: Request,
  ) {
    const ua = req.header('User-Agent')
    const uaparser = new UAParser(ua)
    return this.sessionService.create(createSessionDto, uaparser)
  }
  @Post('refresh')
  async refresh(@Body() refreshSessionDto: RefreshSessionDto) {
    return this.sessionService.refresh(refreshSessionDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Param('username') username: string, @Req() req: Request) {
    const user = await this.userService.findOne(username)
    checkUser(req, user)
    return this.sessionService.findAll(user)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('username') username: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const user = await this.userService.findOne(username)
    checkUser(req, user)
    return this.sessionService.remove(user, id)
  }
}
