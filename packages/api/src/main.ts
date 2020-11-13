import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { getValidationPipe } from './validationPipe'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(getValidationPipe())
  await app.listen(3000)
}
bootstrap()
