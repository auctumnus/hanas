import { Matches, Length, IsOptional } from 'class-validator'

export class CreateUserDto {
  @Matches(/^[a-z0-9-_]+$/)
  @Length(2, 32)
  username: string

  @Length(15, 100)
  @Matches(/[$-/:-?{-~!"^_`\[\]\(\)]/, {
    message: 'password must include a symbol (any of $-/:-?{-~!"^_`[]())',
  })
  @Matches(/[0-9]/, {
    message: 'password must include a number (any of 0123456789)',
  })
  password: string

  @IsOptional()
  @Length(2, 32)
  display_name: string
}
