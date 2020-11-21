import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
  BadRequestException,
} from '@nestjs/common'
import { Request } from 'express'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants'

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Get()
  findAll(@Req() req: Request) {
    const limit = +req.query.limit || DEFAULT_PAGE_SIZE
    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(
        `Limit for returned number of objects is ${MAX_PAGE_SIZE}.`,
      )
    }

    let cursor: string
    if (req.query.cursor && typeof req.query.cursor === 'string') {
      cursor = req.query.cursor
    } else if (req.query.cursor) {
      throw new BadRequestException('Cursor must be a string.')
    }

    return this.userService.findAll(limit, cursor)
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.userService.findOne(username)
  }

  @Patch(':username')
  update(
    @Param('username') username: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(username, updateUserDto)
  }

  @Delete(':username')
  remove(@Param('username') username: string) {
    return this.userService.remove(username)
  }
}
