import { Matches, Length, IsOptional } from 'class-validator'

export class CreateUserDto {
  @Matches(/^[A-Za-z0-9-_]+$/)
  @Length(2, 32)
  username: string

  @Length(15, 64)
  password: string

  @IsOptional()
  @Length(2, 32)
  display_name: string
}
