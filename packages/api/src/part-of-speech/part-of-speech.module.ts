import { Module } from '@nestjs/common'
import { PartOfSpeechService } from './part-of-speech.service'
import { PartOfSpeechController } from './part-of-speech.controller'

@Module({
  controllers: [PartOfSpeechController],
  providers: [PartOfSpeechService],
})
export class PartOfSpeechModule {}
