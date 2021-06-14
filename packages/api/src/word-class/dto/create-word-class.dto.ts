import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class CreateWordClassDto {
  /**
   * The name of the word class.
   * @example Strong Adjective
   */
  @ApiProperty({ example: 'Strong Adjective' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string

  /**
   * The abbreviation of the word class.
   * @example str
   */
  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  abbreviation: string
}
