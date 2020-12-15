import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { LangService } from '../lang/lang.service'
import { Repository } from 'typeorm'
import { Lang } from '../lang/entities/lang.entity'
import { User } from '../user/entities/user.entity'
import { CreateLangPermissionDto } from './dto/create-lang-permission.dto'
import { UpdateLangPermissionDto } from './dto/update-lang-permission.dto'
import { LangPermissions } from './entities/lang-permissions.entity'

export const getUserPermissions = (lang: Lang, username: string) => {
  const [permission] = lang.permissions.filter(
    (perm) => perm.user.username === username,
  )
  if (!permission) {
    throw new NotFoundException()
  } else {
    return permission
  }
}

const permissionList = [
  'owner',
  'changePermissions',
  'changeId',
  'changeInfo',
  'changeWords',
]

const checkAllowedToGrant = (
  newPermissions:
    | LangPermissions
    | UpdateLangPermissionDto
    | CreateLangPermissionDto,
  requestorPermissions: LangPermissions,
) => {
  for (const permission of permissionList) {
    if (
      newPermissions.hasOwnProperty(permission) &&
      !requestorPermissions[permission]
    ) {
      throw new BadRequestException(
        'Cannot grant or revoke permissions the user does not have themselves.',
      )
    }
  }
}

@Injectable()
export class LangPermissionsService {
  constructor(
    @InjectRepository(LangPermissions)
    private permsRepository: Repository<LangPermissions>,

    private langService: LangService,
  ) {}

  async create(
    newPermissions: CreateLangPermissionDto,
    lang: Lang,
    user: User,
    requestorUsername: string,
  ) {
    // would just use getUserPermissions, but we don't want to send a 404
    if (lang.permissions.some((perm) => perm.user.username === user.username)) {
      throw new ConflictException()
    }
    const requestorPermissions = getUserPermissions(lang, requestorUsername)
    if (newPermissions.owner && !requestorPermissions.owner) {
      throw new BadRequestException('Cannot grant owner if user is not owner.')
    } else if (
      newPermissions.changePermissions &&
      !requestorPermissions.owner
    ) {
      throw new BadRequestException(
        'Cannot grant or revoke changePermissions unless user is owner.',
      )
    }
    checkAllowedToGrant(newPermissions, requestorPermissions)
    const result = await this.permsRepository.save({
      user,
      lang,
      ...newPermissions,
    })
    delete result.lang
    delete result.internal_id
    return result
  }

  findAll(lang: Lang) {
    return lang.permissions
  }

  findOne(lang: Lang, username: string) {
    return getUserPermissions(lang, username)
  }

  async update(
    newPermissions: UpdateLangPermissionDto,
    lang: Lang,
    username: string,
    requestorUsername: string,
  ) {
    const permissions = getUserPermissions(lang, username)

    const { internal_id } = permissions
    const requestorPermissions = getUserPermissions(lang, requestorUsername)

    if (requestorUsername === username) {
      throw new BadRequestException("Cannot edit user's own permissions.")
    } else if (permissions.owner) {
      throw new BadRequestException("Cannot edit the owner's permissions.")
    } else if (newPermissions.owner && !requestorPermissions.owner) {
      throw new BadRequestException(
        "Cannot transfer ownership if user is not the language's owner.",
      )
    } else if (
      newPermissions.hasOwnProperty('changePermissions') &&
      !requestorPermissions.owner
    ) {
      throw new BadRequestException(
        'Cannot grant or revoke changePermissions unless user is owner.',
      )
    }
    checkAllowedToGrant(newPermissions, requestorPermissions)
    if (newPermissions.owner) {
      // transfer ownership
      requestorPermissions.owner = false
      newPermissions.changeInfo = true
      newPermissions.changePermissions = true
      newPermissions.changeWords = true
      await this.permsRepository.update(
        { internal_id: requestorPermissions.internal_id },
        requestorPermissions,
      )
    }
    await this.permsRepository.update({ internal_id }, newPermissions)
    const updatedLang = await this.langService.findOne(lang.id)
    return getUserPermissions(updatedLang, username)
  }

  async remove(lang: Lang, username: string, requestorUsername: string) {
    const permissions = getUserPermissions(lang, username)
    const requestorPermissions = getUserPermissions(lang, requestorUsername)
    if (permissions.owner) {
      throw new BadRequestException('Cannot revoke owner permissions.')
    } else if (!requestorPermissions.owner && permissions.changePermissions) {
      throw new BadRequestException(
        'Cannot revoke changePermissions if user is not owner.',
      )
    }
    await this.permsRepository.delete({ internal_id: permissions.internal_id })
  }
}
