import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Lang } from './entities/lang.entity'
import { LangController } from './lang.controller'
import { LangService } from './lang.service'

@Module({
  imports: [TypeOrmModule.forFeature([Lang])],
  providers: [LangService],
  controllers: [LangController],
})
export class LangModule {}
