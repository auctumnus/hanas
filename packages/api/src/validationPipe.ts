import { ValidationPipe as vpipe } from '@nestjs/common'

export const ValidationPipe = new vpipe({
  whitelist: true,
  transform: true,
})
