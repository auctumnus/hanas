import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateWordDto {
  @IsString()
  @IsNotEmpty()
  word: string

  @IsOptional()
  @IsString()
  ipa: string

  @IsString()
  definition: string

  @IsOptional()
  @IsString()
  notes: string

  @IsString()
  partOfSpeech: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wordClasses: string[]
}
