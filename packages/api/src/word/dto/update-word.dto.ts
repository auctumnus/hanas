import { PartialType } from '@nestjs/mapped-types'
import { CreateWordDto } from './create-word.dto'

export class UpdateWordDto extends PartialType(CreateWordDto) {}
