import { IsString } from 'class-validator'

export class RefreshSessionDto {
  @IsString()
  id: string
  @IsString()
  refreshToken: string
}
