import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateWordDto {
  /**
   * The word in the language's orthography.
   * @example sus
   */
  @IsString()
  @IsNotEmpty()
  word: string

  /**
   * The word represented in the International Phonetic Alphabet.
   * @example sʌs
   */
  @IsOptional()
  @IsString()
  ipa: string

  /**
   * The meaning of the word.
   */
  @ApiProperty({ example: 'im just making an among us joke now' })
  @IsString()
  definition: string

  /**
   * Any notes about the word, e.g. usage or such.
   */
  @ApiProperty({ example: 'when the impostor is sus or something' })
  @IsOptional()
  @IsString()
  notes: string

  /**
   * The part of speech for this word, specified by its abbreviation.
   * @example adj
   */
  @IsString()
  partOfSpeech: string

  /**
   * The word classes for this word, specified by their abbreviations.
   */
  @ApiProperty({ type: [String], example: ['str'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wordClasses: string[]
}
