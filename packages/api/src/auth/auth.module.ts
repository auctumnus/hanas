import { forwardRef, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UserModule } from '../user/user.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [forwardRef(() => UserModule), JwtModule.register({})],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
