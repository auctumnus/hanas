import { IsNotEmpty, IsString, Length } from 'class-validator'

export class CreatePartOfSpeechDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  abbreviation: string
}
