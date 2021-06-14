import { IsString } from 'class-validator'

export class CreateSessionDto {
  /**
   * Username to log in with.
   * @example alice
   */
  @IsString()
  username: string

  /**
   * Password for this user.
   * @example correcthorsebatterystaple
   */
  @IsString()
  password: string
}
