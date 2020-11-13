import { PartialType } from '@nestjs/mapped-types'
import { CreateLangDto } from './create-lang.dto'

export class UpdateLangDto extends PartialType(CreateLangDto) {}
