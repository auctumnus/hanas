import {
  IsAlpha,
  IsString,
  IsLowercase,
  Length,
  MaxLength,
  IsOptional,
} from 'class-validator'

export class CreateLangDto {
  @IsString()
  @Length(3, 5)
  @IsAlpha()
  @IsLowercase()
  id: string

  @IsString()
  @Length(1, 32)
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string
}
