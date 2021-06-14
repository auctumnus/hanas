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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import { Request } from 'express'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { ApiPaginated, getLimitAndCursor, pagedSchema } from '../paginator'
import { checkUser } from '../auth/checkUser'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { FileInterceptor } from '@nestjs/platform-express'
import { multerSettings, S3File, validateFile } from '../s3'
import {
  ALLOWED_TYPES,
  BANNER_MAX_HEIGHT,
  BANNER_MAX_WIDTH,
  PFP_MAX_LENGTH,
} from '../constants'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
  PartialType,
} from '@nestjs/swagger'
import { User } from './entities/user.entity'
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../errors'
import { DeleteSuccess } from '../deleteSuccess'

class PfpUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  'profile-picture': any
}

class BannerUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  banner: any
}

class Pfp {
  @ApiProperty({
    example:
      'https://my-bucket.s3.us-west-2.amazonaws.com/YhEcI1URMGimpoyAav9Zp',
  })
  profile_picture: string
}

class Banner {
  @ApiProperty({
    example:
      'https://my-bucket.s3.us-west-2.amazonaws.com/2F-oOC5ejzZuCZdp01OWS',
  })
  banner: string
}

const pfpSettings = {
  maxWidth: PFP_MAX_LENGTH,
  maxHeight: PFP_MAX_LENGTH,
}

const bannerSettings = {
  maxWidth: BANNER_MAX_WIDTH,
  maxHeight: BANNER_MAX_HEIGHT,
}

class UpdateUserSwaggerDto extends PartialType(CreateUserDto) {}

@ApiTags('Users')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    description: 'Creates a user.',
    summary: 'Create a user',
  })
  @ApiCreatedResponse({ type: User })
  @ApiBadRequestResponse({ type: BadRequestError })
  @ApiConflictResponse({ type: ConflictError })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @ApiOperation({
    description: 'Gets all users, with pagination.',
    summary: 'Get all users',
  })
  @ApiPaginated()
  @ApiOkResponse(pagedSchema(User))
  @Get()
  findAll(@Req() req: Request) {
    const { limit, cursor } = getLimitAndCursor(req)
    return this.userService.findAll(limit, cursor)
  }

  @ApiOperation({
    description: 'Finds a user by their username.',
    summary: 'Find a user',
  })
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse({ type: NotFoundError })
  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.userService.findOne(username)
  }

  @ApiBody({ type: UpdateUserSwaggerDto })
  @ApiOkResponse({ type: User })
  @ApiBadRequestResponse({ type: BadRequestError })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiConflictResponse({ type: ConflictError })
  @ApiOperation({
    description: 'Updates a user.',
    summary: 'Update a user',
  })
  @ApiBearerAuth()
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

  @ApiOperation({
    description: 'Deletes a user forever.',
    summary: 'Delete a user',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: DeleteSuccess })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiNotFoundResponse({ type: NotFoundError })
  @Delete(':username')
  async remove(@Param('username') username: string, @Req() req: Request) {
    const user = await this.userService.findOne(username)
    checkUser(req, user)
    return this.userService.remove(username)
  }

  // profile picture endpoints
  @ApiOperation({
    description: "Gets a user's profile picture.",
    summary: 'Get a profile picture',
  })
  @Get(':username/profile-picture')
  @ApiOkResponse({ type: Pfp })
  @ApiNotFoundResponse({ type: NotFoundError })
  async getProfilePicture(@Param('username') username: string) {
    const { profile_picture } = await this.userService.findOne(username)
    return { profile_picture }
  }

  @ApiOperation({
    description: 'Sets a profile picture for a user.',
    summary: 'Create a profile picture',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'The profile picture to be used',
    type: PfpUploadDto,
  })
  @Post(':username/profile-picture')
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiNotFoundResponse({ type: NotFoundError })
  @UseInterceptors(
    FileInterceptor('profile-picture', multerSettings(pfpSettings)),
  )
  async createProfilePicture(
    @Param('username') username: string,
    @Req() req: Request,
    @UploadedFile() file: S3File,
  ) {
    const user = await this.userService.findOne(username)
    checkUser(req, user)
    validateFile(file, ALLOWED_TYPES)
    return this.userService.createProfilePicture(user, file)
  }

  @ApiOperation({
    description: "Updates a user's profile picture.",
    summary: 'Update a profile picture',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'The profile picture to be used',
    type: PfpUploadDto,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiNotFoundResponse({ type: NotFoundError })
  @Patch(':username/profile-picture')
  @UseInterceptors(
    FileInterceptor('profile-picture', multerSettings(pfpSettings)),
  )
  updateProfilePicture(
    @Param('username') username: string,
    @Req() req: Request,
    @UploadedFile() file: S3File,
  ) {
    return this.createProfilePicture(username, req, file)
  }

  @ApiOperation({
    description: 'Removes the profile picture for a user.',
    summary: 'Delete a profile picture',
  })
  @ApiOkResponse({ type: DeleteSuccess })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':username/profile-picture')
  async removeProfilePicture(
    @Param('username') username: string,
    @Req() req: Request,
  ) {
    const user = await this.userService.findOne(username)
    checkUser(req, user)
    return this.userService.removeProfilePicture(user)
  }

  // profile picture endpoints
  @ApiOperation({
    description: 'Gets the banner for a user.',
    summary: 'Get a banner',
  })
  @ApiOkResponse({ type: Banner })
  @ApiNotFoundResponse({ type: NotFoundError })
  @Get(':username/banner')
  async getBanner(@Param('username') username: string) {
    const { banner } = await this.userService.findOne(username)
    return { banner }
  }

  @ApiOperation({
    description: 'Sets the banner for a user.',
    summary: 'Create a banner',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'The banner to be used',
    type: BannerUploadDto,
  })
  @ApiCreatedResponse({
    type: User,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiNotFoundResponse({ type: NotFoundError })
  @Post(':username/banner')
  @UseInterceptors(FileInterceptor('banner', multerSettings(bannerSettings)))
  async createBanner(
    @Param('username') username: string,
    @Req() req: Request,
    @UploadedFile() file: S3File,
  ) {
    const user = await this.userService.findOne(username)
    checkUser(req, user)
    validateFile(file, ALLOWED_TYPES)
    return this.userService.createBanner(user, file)
  }

  @ApiOperation({
    description: 'Updates the banner for a user.',
    summary: 'Update a banner',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'The banner to be used',
    type: BannerUploadDto,
  })
  @ApiOkResponse({ type: User })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiNotFoundResponse({ type: NotFoundError })
  @Patch(':username/banner')
  @UseInterceptors(FileInterceptor('banner', multerSettings(bannerSettings)))
  updateBanner(
    @Param('username') username: string,
    @Req() req: Request,
    @UploadedFile() file: S3File,
  ) {
    return this.createBanner(username, req, file)
  }

  @ApiOperation({
    description: 'Removes the banner for a user.',
    summary: 'Delete a banner',
  })
  @ApiOkResponse({ type: DeleteSuccess })
  @ApiUnauthorizedResponse({ type: UnauthorizedError })
  @ApiForbiddenResponse({ type: ForbiddenError })
  @ApiNotFoundResponse({ type: NotFoundError })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':username/banner')
  async removeBanner(@Param('username') username: string, @Req() req: Request) {
    const user = await this.userService.findOne(username)
    checkUser(req, user)
    return this.userService.removeBanner(user)
  }
}
