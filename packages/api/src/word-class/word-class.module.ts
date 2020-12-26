import { Module } from '@nestjs/common'
import { WordClassService } from './word-class.service'
import { WordClassController } from './word-class.controller'

@Module({
  controllers: [WordClassController],
  providers: [WordClassService],
})
export class WordClassModule {}
