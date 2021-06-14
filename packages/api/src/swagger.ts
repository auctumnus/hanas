import { INestApplication } from '@nestjs/common'
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger'
import { ApiError } from './errors'
import { Paginated } from './paginator'
import { DeleteSuccess } from './deleteSuccess'
import {Session} from './session/entities/session.entity'

export const getDocument = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Hanas')
    .setDescription('Conlanging tool and community')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [Paginated, ApiError, DeleteSuccess, Session],
  })

  const documentOptions: SwaggerCustomOptions = {
    customSiteTitle: 'Hanas API Docs',
  }
  return { document, documentOptions }
}
