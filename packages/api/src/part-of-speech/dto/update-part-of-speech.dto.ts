import { PartialType } from '@nestjs/swagger'
import { CreatePartOfSpeechDto } from './create-part-of-speech.dto'

export class UpdatePartOfSpeechDto extends PartialType(CreatePartOfSpeechDto) {}
