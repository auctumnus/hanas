import { PartialType } from '@nestjs/swagger'
import { CreateLangPermissionDto } from './create-lang-permission.dto'

export class UpdateLangPermissionDto extends PartialType(
  CreateLangPermissionDto,
) {}
