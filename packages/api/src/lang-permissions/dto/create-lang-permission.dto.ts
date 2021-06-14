import {ApiProperty} from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'

export class CreateLangPermissionDto {
  /**
   * Whether the user is the owner of this language. There is always one owner
   * for a language - if the owner deletes their account, the language will
   * be deleted as well. The owner is the only user who can assign the owner
   * permission to anyone else, and cannot remove it from themselves. They are
   * also the only ones able to assign or revoke the changePermissions permission.
   * @example true
   */
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  owner: boolean

  /**
   * Whether the user can change permissions for other contributors. They can
   * change the permissions for anyone other than the owner, and cannot grant
   * or revoke owner. One cannot edit their own permissions, however.
   * @example true
   */
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  changePermissions: boolean

  /**
   * Whether the user can change the language's ID.
   * @example true
   */
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  changeId: boolean

  /**
   * Whether the user can change the language's info - word classes,
   * parts of speech, flag, description, and name.
   * @example true
   */
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  changeInfo: boolean

  /**
   * Whether the user can create, update, edit, or delete words for the language.
   * @example true
   */
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  changeWords: boolean
}
