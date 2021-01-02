import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from './validationPipe'
import { TrimPipe } from './trimPipe'
import { classTransformerInterceptor } from './classTransformerInterceptor'
import { ClacksMiddleware } from './clacks.middleware'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new TrimPipe(), ValidationPipe)
  app.useGlobalInterceptors(new classTransformerInterceptor())
  app.use(ClacksMiddleware)
  await app.listen(3000)
}
bootstrap()
