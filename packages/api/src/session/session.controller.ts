import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common'
import { SessionService } from './session.service'
import { CreateSessionDto } from './dto/create-session.dto'
import { UserService } from '../user/user.service'
import { UAParser } from 'ua-parser-js'
import { Request } from 'express'
import { RefreshSessionDto } from './dto/refresh-session.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { checkUser } from '../auth/checkUser'
import { ApiPaginated, getLimitAndCursor, pagedSchema } from '../paginator'
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiProperty, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import {BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError} from 'src/errors'
import {User} from 'src/user/entities/user.entity'
import { Session } from './entities/session.entity'
import { DeleteSuccess } from 'src/deleteSuccess'

class SessionCreated {
  /**
   * The user who is logged in through this session.
   */
  @ApiProperty({
    description: 'The user who is logged in through this session.'
  })
  user: User

  /**
   * The access token to use for authenticating.
   * @example 
   */
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
             'eyJ1c2VybmFtZSI6ImFsaWNlIiwic3ViIjoxLCJpYXQiOjE2MjMyNzIyNjUsImV4cCI6MTYyMzI3MjU2NX0.' +
             'NrJ_JY28CleFi_9BrWJ07-aMk9G12kWypQWnCJrUO1Y',
    description: 'The access token to use for authentication.'
  })
  accessToken: string

  @ApiProperty({
    description: 'Session information.'
  })
  refreshToken: RefreshSessionDto
}

class RefreshSuccess {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
    'eyJ1c2VybmFtZSI6ImFsaWNlIiwic3ViIjoyLCJpYXQiOjE2MjMyNzYyNTIsImV4cCI6MTYyMzI3NjU1Mn0.' + 
    'dTg58lku-kYMKADXQzena_FJZpDLK2icQ_oN22HO76c',
    description: 'The new access token.'
  })
  accessToken: string
}

class RefreshExpired extends UnauthorizedError {
  @ApiProperty({ example: 'Expired token.' })
  message: string
}

class RefreshRancid extends BadRequestError {
  @ApiProperty({ example: 'Invalid token.' })
  message: string
}

@ApiTags('Sessions')
@Controller()
export class SessionController {
  constructor(
    private sessionService: SessionService,
    private userService: UserService,
  ) {}
  
  @ApiOperation({
    description: 'Creates a session for a user.',
    summary: 'Create a session'
  })
  @ApiCreatedResponse({ type: SessionCreated })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @Post()
  async create(
    @Body() createSessionDto: CreateSessionDto,
    @Req() req: Request,
    @Param('username') username: string,
  ) {
    if (username !== createSessionDto.username) {
      throw new ForbiddenException('Cannot make a session for another user!')
    }
    const ua = req.header('User-Agent')
    const uaparser = new UAParser(ua)
    return this.sessionService.create(createSessionDto, uaparser)
  }

  @ApiOperation({
    description: 'Refresh a session, getting a new access token to use.',
    summary: 'Refresh a session'
  })
  @ApiCreatedResponse({ type: RefreshSuccess})
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiUnauthorizedResponse({ type: RefreshExpired })
  @ApiBadRequestResponse({ type: RefreshRancid })
  @Post('refresh')
  async refresh(@Body() refreshSessionDto: RefreshSessionDto) {
    return this.sessionService.refresh(refreshSessionDto)
  }

  @ApiOperation({
    description: 'Gets all sessions by a user, with pagination. ' +
                 'Note that expired sessions will not be removed - ' +
                 'you can check the refresh JWT to see which ones are ' +
                 'actually active.',
    summary: 'Get all sessions'
  })
  @ApiOkResponse(pagedSchema(Session))
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiPaginated()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Param('username') username: string, @Req() req: Request) {
    const user = await this.userService.findOne(username)
    checkUser(req, user)
    const { limit, cursor } = getLimitAndCursor(req)
    return this.sessionService.findAll(user, limit, cursor)
  }

  @ApiOperation({
    description: 'Delete a session. Note that if you delete a session before the refresh token is expired,' +
                 'the refresh token will still be valid.',
    summary: 'Delete a session'
  })
  @ApiOkResponse({ type: DeleteSuccess })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiBearerAuth()
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
