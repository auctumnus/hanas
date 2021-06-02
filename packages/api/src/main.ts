import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from './validationPipe'
import { TrimPipe } from './trimPipe'
import { classTransformerInterceptor } from './classTransformerInterceptor'
import { clacks } from './clacks.middleware'
import { PORT } from './constants'
import { setupBuckets } from './s3'
import { SwaggerModule } from '@nestjs/swagger'
import { getDocument } from './swagger'

export async function bootstrap(port: number, logger: boolean) {
  await setupBuckets()
  const app = await NestFactory.create(AppModule, { logger })
  app.useGlobalPipes(new TrimPipe(), ValidationPipe)
  app.useGlobalInterceptors(new classTransformerInterceptor())
  app.use(clacks)

  const { document, documentOptions } = getDocument(app)

  SwaggerModule.setup('api', app, document, documentOptions)

  await app.listen(port)
  return app
}
bootstrap(PORT, true)
