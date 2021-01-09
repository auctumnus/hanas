import { forwardRef, Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { SessionModule } from '../session/session.module'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from '../auth/jwt.strategy'
import { LangModule } from '../lang/lang.module'

@Module({
  imports: [
    forwardRef(() => SessionModule),
    forwardRef(() => LangModule),
    JwtModule.register({}),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
