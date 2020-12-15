import { forwardRef, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '../user/user.module'
import { JwtStrategy } from '../auth/jwt.strategy'
import { Lang } from './entities/lang.entity'
import { LangPermissions } from '../lang-permissions/entities/lang-permissions.entity'
import { LangController } from './lang.controller'
import { LangService } from './lang.service'

@Module({
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([Lang, LangPermissions]),
    JwtModule.register({}),
  ],
  providers: [LangService, JwtStrategy],
  controllers: [LangController],
  exports: [LangService],
})
export class LangModule {}
