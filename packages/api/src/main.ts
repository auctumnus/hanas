import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from './validationPipe'
import { TrimPipe } from './trimPipe'
import { classTransformerInterceptor } from './classTransformerInterceptor'
import { clacks } from './clacks.middleware'
import { PORT } from './constants'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new TrimPipe(), ValidationPipe)
  app.useGlobalInterceptors(new classTransformerInterceptor())
  app.use(clacks)
  await app.listen(PORT)
}
bootstrap()
