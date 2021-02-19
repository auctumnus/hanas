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
import { getLimitAndCursor } from '../paginator'
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


const pfpSettings = {
  maxWidth: PFP_MAX_LENGTH,
  maxHeight: PFP_MAX_LENGTH,
}

const bannerSettings = {
  maxWidth: BANNER_MAX_WIDTH,
  maxHeight: BANNER_MAX_HEIGHT,
}

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

  // profile picture endpoints
  @Get(':username/profile-picture')
  async getProfilePicture(@Param('username') username: string) {
    const {profile_picture} = await this.userService.findOne(username)
    return {profile_picture}
  }

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
  @Get(':username/banner')
  async getBanner(@Param('username') username: string) {
    const { banner } = await this.userService.findOne(username)
    return { banner }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':username/banner')
  @UseInterceptors(
    FileInterceptor('profile-picture', multerSettings(bannerSettings)),
  )
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

  @UseGuards(JwtAuthGuard)
  @Patch(':username/banner')
  @UseInterceptors(
    FileInterceptor('profile-picture', multerSettings(bannerSettings)),
  )
  updateBanner(
    @Param('username') username: string,
    @Req() req: Request,
    @UploadedFile() file: S3File,
  ) {
    return this.createBanner(username, req, file)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':username/banner')
  async removeBanner(@Param('username') username: string, @Req() req: Request) {
    const user = await this.userService.findOne(username)
    checkUser(req, user)
    return this.userService.removeBanner(user)
  }
}
