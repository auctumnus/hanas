import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { ValidationPipe } from '../src/validationPipe'
import { TrimPipe } from '../src/trimPipe'
import { classTransformerInterceptor } from '../src/classTransformerInterceptor'

export const makeTestingApp = async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleFixture.createNestApplication()
  app.useGlobalPipes(new TrimPipe(), ValidationPipe)
  app.useGlobalInterceptors(new classTransformerInterceptor())
  return app
}
