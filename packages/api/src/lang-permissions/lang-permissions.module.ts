import { forwardRef, Module } from '@nestjs/common'
import { LangPermissionsService } from './lang-permissions.service'
import { LangPermissionsController } from './lang-permissions.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LangModule } from '../lang/lang.module'
import { UserModule } from '../user/user.module'
import { LangPermissions } from './entities/lang-permissions.entity'
import { Lang } from '../lang/entities/lang.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([LangPermissions, Lang]),
    LangModule,
    UserModule,
  ],
  controllers: [LangPermissionsController],
  providers: [LangPermissionsService],
})
export class LangPermissionsModule {}
