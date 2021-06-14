import { PartialType } from '@nestjs/swagger'
import { CreateWordClassDto } from './create-word-class.dto'

export class UpdateWordClassDto extends PartialType(CreateWordClassDto) {}
