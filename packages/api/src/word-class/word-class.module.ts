import { forwardRef, Module } from '@nestjs/common'
import { WordClassService } from './word-class.service'
import { WordClassController } from './word-class.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WordClass } from './entities/word-class.entity'
import { Lang } from '../lang/entities/lang.entity'
import { LangModule } from '../lang/lang.module'
// import { UserModule } from '../user/user.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([WordClass, Lang]),
    LangModule,
    // forwardRef(() => UserModule),
  ],
  controllers: [WordClassController],
  providers: [WordClassService],
})
export class WordClassModule {}
