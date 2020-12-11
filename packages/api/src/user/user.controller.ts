import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { getLimitAndCursor } from '../paginator'
import { checkUser } from '../auth/checkUser'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Get()
  findAll(@Req() req: Request) {
    const { limit, cursor } = getLimitAndCursor(req)
    return this.userService.findAll(limit, cursor)
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.userService.findOne(username)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':username')
  async update(
    @Param('username') username: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = await this.userService.findOne(username)
    checkUser(req, user)
    return this.userService.update(username, updateUserDto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':username')
  async remove(@Param('username') username: string, @Req() req: Request) {
    const user = await this.userService.findOne(username)
    checkUser(req, user)
    return this.userService.remove(username)
  }
}
