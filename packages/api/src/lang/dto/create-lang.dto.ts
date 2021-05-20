import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger'
import {
  IsAlpha,
  IsString,
  IsLowercase,
  Length,
  MaxLength,
  IsOptional,
} from 'class-validator'

export class CreateLangDto {
  @ApiProperty()
  @IsString()
  @Length(3, 5)
  @IsAlpha()
  @IsLowercase()
  id: string

  @ApiProperty()
  @IsString()
  @Length(1, 32)
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string
}
