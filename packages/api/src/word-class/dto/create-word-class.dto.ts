import { IsNotEmpty, IsString, Length } from 'class-validator'

export class CreateWordClassDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  abbreviation: string
}
