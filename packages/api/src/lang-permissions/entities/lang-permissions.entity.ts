import { Exclude } from 'class-transformer'
import { User } from '../../user/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Lang } from '../../lang/entities/lang.entity'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'

@Entity()
export class LangPermissions {
  @ApiHideProperty()
  @Exclude()
  @PrimaryGeneratedColumn()
  internal_id: number

  /**
   * The user whose permissions are described by this permissions object.
   */
  @ApiProperty()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User

  /**
   * The language for which this permissions object applies.
   */
  @ApiProperty()
  @ManyToOne(() => Lang, (lang) => lang.permissions, { onDelete: 'CASCADE' })
  lang: Lang

  /**
   * Whether the user is the owner of this language. There is always one owner
   * for a language - if the owner deletes their account, the language will
   * be deleted as well. The owner is the only user who can assign the owner
   * permission to anyone else, and cannot remove it from themselves. They are
   * also the only ones able to assign or revoke the changePermissions permission.
   * @example true
   */
  @ApiProperty()
  @Column({ default: false })
  owner: boolean

  /**
   * Whether the user can change permissions for other contributors. They can
   * change the permissions for anyone other than the owner, and cannot grant
   * or revoke owner. One cannot edit their own permissions, however.
   * @example true
   */
  @ApiProperty()
  @Column({ default: false })
  changePermissions: boolean

  /**
   * Whether the user can change the language's ID.
   * @example true
   */
  @ApiProperty()
  @Column({ default: false })
  changeId: boolean

  /**
   * Whether the user can change the language's info - word classes,
   * parts of speech, flag, description, and name.
   * @example true
   */
  @ApiProperty()
  @Column({ default: false })
  changeInfo: boolean

  /**
   * Whether the user can create, update, edit, or delete words for the language.
   * @example true
   */
  @ApiProperty()
  @Column({ default: false })
  changeWords: boolean

  /**
   * The timestamp when the permissions were added.
   * @example 2021-05-23T01:06:53.812Z
   */
  @ApiProperty()
  @CreateDateColumn()
  created: Date

  /**
   * The timestamp when the permissions were last updated.
   * @example 2021-05-23T01:09:47.236Z
   */
  @ApiProperty()
  @UpdateDateColumn()
  updated: Date
}
