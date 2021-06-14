import { PartialType } from '@nestjs/mapped-types'
import { CreateLangPermissionDto } from './create-lang-permission.dto'

export class UpdateLangPermissionDto extends PartialType(
  CreateLangPermissionDto,
) {}
