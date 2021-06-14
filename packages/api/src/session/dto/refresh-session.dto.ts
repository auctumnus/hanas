import { IsString } from 'class-validator'

export class RefreshSessionDto {
  /**
   * ID of the session to refresh.
   * @example BjaY5_nF68Yr54TdxjaPW
   */
  @IsString()
  id: string

  /**
   * Refresh token from the session to refresh.
   * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsaWNlIiwic3ViIjoxLCJpYXQiOjE2MjMyNzIyNjUsImV4cCI6MTYyNTg2NDI2NX0.Ni1AMYLH3bQpM9TL5zFVt_lCvaWqcGwTzDZfw02cn5w
   */
  @IsString()
  refreshToken: string
}
