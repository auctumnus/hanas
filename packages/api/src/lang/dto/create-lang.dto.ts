import {
  IsAlpha,
  IsString,
  IsLowercase,
  MaxLength,
  IsOptional,
  MinLength,
} from 'class-validator'

export class CreateLangDto {
  /**
   * The ID of the language. Must be from 3-5 characters, and lowercase [a-z].
   * @example exa
   */
  @IsString()
  @MinLength(3)
  @MaxLength(5)
  @IsAlpha()
  @IsLowercase()
  id: string

  /**
   * The name of the language.
   * @example Examplish
   */
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  name: string

  /**
   * A short description of the language - compare the first few paragraphs
   * of a Wikipedia article.
   * @example This is a very cool example language! You should read more about it.
   */
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string
}
