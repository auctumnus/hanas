import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { getValidationPipe } from '../src/validationPipe'

export const makeTestingApp = async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleFixture.createNestApplication()
  app.useGlobalPipes(getValidationPipe())
  return app
}
