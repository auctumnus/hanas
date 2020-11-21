import { IsString } from 'class-validator'

export class CreateSessionDto {
  @IsString()
  username: string

  @IsString()
  password: string
}
