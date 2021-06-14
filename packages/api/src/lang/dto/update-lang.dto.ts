import { PartialType } from '@nestjs/swagger'
import { CreateLangDto } from './create-lang.dto'

export class UpdateLangDto extends PartialType(CreateLangDto) {}
