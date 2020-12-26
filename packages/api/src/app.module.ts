import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LangModule } from './lang/lang.module'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { SessionModule } from './session/session.module'
import { Lang } from './lang/entities/lang.entity'
import { User } from './user/entities/user.entity'
import { Session } from './session/entities/session.entity'
import { databaseConfig } from './constants'
import { RouterModule, Routes } from 'nest-router'
import { LangPermissionsModule } from './lang-permissions/lang-permissions.module'
import { WordModule } from './word/word.module'
import { PartOfSpeechModule } from './part-of-speech/part-of-speech.module'
import { WordClassModule } from './word-class/word-class.module'

const routes: Routes = [
  {
    path: '/lang',
    module: LangModule,
    children: [
      {
        path: '/:lang_id/permissions',
        module: LangPermissionsModule,
      },
      {
        path: '/:lang_id/word',
        module: WordModule,
      },
      {
        path: '/:lang_id/part-of-speech',
        module: PartOfSpeechModule,
      },
      {
        path: '/:lang_id/word-class',
        module: WordClassModule,
      },
    ],
  },
  {
    path: '/user',
    module: UserModule,
    children: [
      {
        path: '/:username/session',
        module: SessionModule,
      },
    ],
  },
]

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...databaseConfig,
      autoLoadEntities: true,
      entities: [Lang, User, Session],
      synchronize: true,
    }),
    RouterModule.forRoutes(routes),
    LangModule,
    UserModule,
    AuthModule,
    SessionModule,
    LangPermissionsModule,
    WordModule,
    PartOfSpeechModule,
    WordClassModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
