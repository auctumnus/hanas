import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from './validationPipe'
import { TrimPipe } from './trimPipe'
import { classTransformerInterceptor } from './classTransformerInterceptor'
import { clacks } from './clacks.middleware'
import { PORT } from './constants'
import { setupBuckets } from './s3'
import { SwaggerModule, DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger'
import { Paginated } from './paginator' 
import { ApiError } from './errors'

export async function bootstrap(port: number, logger: boolean) {
  await setupBuckets()
  const app = await NestFactory.create(AppModule, { logger })
  app.useGlobalPipes(new TrimPipe(), ValidationPipe)
  app.useGlobalInterceptors(new classTransformerInterceptor())
  app.use(clacks)

  const config = new DocumentBuilder()
    .setTitle('Hanas')
    .setDescription('Conlanging tool and community')
    .setVersion('0.1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ Paginated, ApiError ]
  })

  const documentOptions: SwaggerCustomOptions = {
    customSiteTitle: 'Hanas API Docs',

  }

  SwaggerModule.setup('api', app, document, documentOptions)

  await app.listen(port)
  return app
}
bootstrap(PORT, true)
