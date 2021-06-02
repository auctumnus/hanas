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
import { getLimitAndCursor, pagedSchema } from '../paginator'
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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { User } from './entities/user.entity'

const pfpSettings = {
  maxWidth: PFP_MAX_LENGTH,
  maxHeight: PFP_MAX_LENGTH,
}

const bannerSettings = {
  maxWidth: BANNER_MAX_WIDTH,
  maxHeight: BANNER_MAX_HEIGHT,
}

@ApiTags('Users')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    description: 'Creates a user.',
    summary: 'Create a user',
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @ApiOperation({
    description: 'Gets all users, with pagination.',
    summary: 'Get all users',
  })
  @Get()
  findAll(@Req() req: Request) {
    const { limit, cursor } = getLimitAndCursor(req)
    return this.userService.findAll(limit, cursor)
  }

  @ApiOperation({
    description: 'Finds a user by their username.',
    summary: 'Find a user',
  })
  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.userService.findOne(username)
  }

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
  @Delete(':username')
  async remove(@Param('username') username: string, @Req() req: Request) {
    const user = await this.userService.findOne(username)
    checkUser(req, user)
    return this.userService.remove(username)
  }

  // profile picture endpoints
  @ApiOperation({
    description: "Get a user's profile picture.",
    summary: 'Get a profile picture',
  })
  @Get(':username/profile-picture')
  async getProfilePicture(@Param('username') username: string) {
    const { profile_picture } = await this.userService.findOne(username)
    return { profile_picture }
  }

  @ApiOperation({
    description: 'Set a profile picture for a user.',
    summary: 'Create a profile picture',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':username/profile-picture')
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
    description: "Update a user's profile picture.",
    summary: 'Update a profile picture',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
    description: 'Remove the profile picture for a user',
    summary: 'Delete a profile picture',
  })
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
    description: 'Get the banner for a user',
    summary: 'Get a banner',
  })
  @Get(':username/banner')
  async getBanner(@Param('username') username: string) {
    const { banner } = await this.userService.findOne(username)
    return { banner }
  }

  @ApiOperation({
    description: 'Set the banner for a user',
    summary: 'Create a banner',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
    description: 'Update the banner for a user',
    summary: 'Update a banner',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
    description: 'Remove the banner for a user',
    summary: 'Delete a banner',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':username/banner')
  async removeBanner(@Param('username') username: string, @Req() req: Request) {
    const user = await this.userService.findOne(username)
    checkUser(req, user)
    return this.userService.removeBanner(user)
  }
}
