import { Matches, Length, IsOptional, MaxLength, MinLength } from 'class-validator'

export class CreateUserDto {
  /**
   * The username that this user should be found under. Alphanumeric, plus dash and
   * underscore.
   * @example alice
   */
  @Matches(/^[A-Za-z0-9-_]+$/)
  @MaxLength(32)
  @MinLength(2)
  username: string

  /**
   * The password to use for the user. I've been informed that fifteen characters
   * may be a bit much, but I figure it's better to be safe than sorry. Max is 64
   * since bcrypt truncates anything afterward anyway.
   * @example hunter222
   */
  @MaxLength(64)
  @MinLength(15)
  password: string

  /**
   * The name that the user would prefer to be displayed. If blank, defaults
   * to the username.
   * @example AliceSmith
   */ 
  @IsOptional()
  @MaxLength(32)
  @MinLength(2)
  display_name: string
}
