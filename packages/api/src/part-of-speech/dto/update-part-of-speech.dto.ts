import { PartialType } from '@nestjs/mapped-types'
import { CreatePartOfSpeechDto } from './create-part-of-speech.dto'

export class UpdatePartOfSpeechDto extends PartialType(CreatePartOfSpeechDto) {}
