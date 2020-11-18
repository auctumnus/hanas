import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LangModule } from './lang/lang.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [TypeOrmModule.forRoot(), LangModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
