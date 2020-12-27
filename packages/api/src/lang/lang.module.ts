import { forwardRef, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '../user/user.module'
import { JwtStrategy } from '../auth/jwt.strategy'
import { Lang } from './entities/lang.entity'
import { LangPermissions } from '../lang-permissions/entities/lang-permissions.entity'
import { LangController } from './lang.controller'
import { LangService } from './lang.service'
import { PartOfSpeech } from '../part-of-speech/entities/part-of-speech.entity'
import { WordClass } from '../word-class/entities/word-class.entity'

@Module({
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([Lang, LangPermissions, PartOfSpeech, WordClass]),
    JwtModule.register({}),
  ],
  providers: [LangService, JwtStrategy],
  controllers: [LangController],
  exports: [LangService],
})
export class LangModule {}
