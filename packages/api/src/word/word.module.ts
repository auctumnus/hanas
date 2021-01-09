import { forwardRef, Module } from '@nestjs/common'
import { WordService } from './word.service'
import { WordController } from './word.controller'
import { LangModule } from '../lang/lang.module'
import { UserModule } from '../user/user.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Word } from './entities/word.entity'

@Module({
  imports: [
    forwardRef(() => LangModule),
    UserModule,
    TypeOrmModule.forFeature([Word]),
  ],
  controllers: [WordController],
  providers: [WordService],
})
export class WordModule {}
