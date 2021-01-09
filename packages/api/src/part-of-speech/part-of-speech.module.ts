import { forwardRef, Module } from '@nestjs/common'
import { PartOfSpeechService } from './part-of-speech.service'
import { PartOfSpeechController } from './part-of-speech.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PartOfSpeech } from './entities/part-of-speech.entity'
import { Lang } from '../lang/entities/lang.entity'
import { LangModule } from '../lang/lang.module'
// import { UserModule } from '../user/user.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([PartOfSpeech, Lang]),
    LangModule,
    // forwardRef(() => UserModule),
  ],
  controllers: [PartOfSpeechController],
  providers: [PartOfSpeechService],
})
export class PartOfSpeechModule {}
