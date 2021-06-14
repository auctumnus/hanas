import { PartialType } from '@nestjs/mapped-types'
import { CreateWordClassDto } from './create-word-class.dto'

export class UpdateWordClassDto extends PartialType(CreateWordClassDto) {}
