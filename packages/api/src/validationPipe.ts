import { ValidationPipe } from '@nestjs/common'

export const getValidationPipe = () =>
  new ValidationPipe({
    whitelist: true,
    transform: true,
  })
