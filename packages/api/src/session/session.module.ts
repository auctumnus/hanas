import { forwardRef, Module } from '@nestjs/common'
import { SessionService } from './session.service'
import { SessionController } from './session.controller'
import { UserModule } from '../user/user.module'
import { AuthModule } from '../auth/auth.module'
import { JwtModule } from '@nestjs/jwt'
import { Session } from './entities/session.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtStrategy } from '../auth/jwt.strategy'

@Module({
  imports: [
    forwardRef(() => UserModule),
    AuthModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Session]),
  ],
  controllers: [SessionController],
  providers: [SessionService, JwtStrategy],
  exports: [SessionService],
})
export class SessionModule {}
