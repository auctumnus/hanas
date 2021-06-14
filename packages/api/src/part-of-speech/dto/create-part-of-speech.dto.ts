import { IsNotEmpty, IsString, Length } from 'class-validator'

export class CreatePartOfSpeechDto {
  /**
   * The name of this part of speech.
   * @example Adjective
   */
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string

  /**
   * The abbreviation of this part of speech.
   * @example adj
   */
  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  abbreviation: string
}
