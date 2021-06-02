import { Exclude } from 'class-transformer'
import { User } from '../../user/entities/user.entity'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  AfterLoad,
} from 'typeorm'
import { LangPermissions } from '../../lang-permissions/entities/lang-permissions.entity'
import { PartOfSpeech } from '../../part-of-speech/entities/part-of-speech.entity'
import { WordClass } from '../../word-class/entities/word-class.entity'
import { ApiHideProperty } from '@nestjs/swagger'

@Entity()
export class Lang {
  @ApiHideProperty()
  @Exclude()
  @PrimaryGeneratedColumn()
  internal_id: number

  /**
   * The ID of the language. Must be from 3-5 characters, and lowercase [a-z].
   * @example exa
   */
  @Column({ unique: true, length: 5 })
  id: string

  /**
   * The name of the language.
   * @example Examplish
   */
  @Column()
  name: string

  /**
   * A short description of the language - compare the first few paragraphs of
   * a Wikipedia article.
   * @example This is a very cool example language! You should read more about it.
   */
  @Column({ default: '' })
  description: string

  /**
   * A link to the image for the flag of the language. By default, the image is
   * 800 pixels square at maximum, but can be any size or aspect ratio. If
   * the flag is bigger than that, it'll crop it using sharp's cover fit resize -
   * which, if the docs are to be believed, should be equivalent to the CSS
   * `object-fit: cover; object-position: center;`
   * @example https://my-bucket.s3.us-west-2.amazonaws.com/0UfVPsLpvMaaJMg11o8GR
   */
  @Column({ default: '' })
  flag: string

  /**
   * The timestamp when the language was created.
   * @example 2021-05-23T01:06:53.812Z
   */
  @CreateDateColumn()
  created: Date

  /**
   * The timestamp when the language was last updated - this does not
   * include addition of words.
   * @example 2021-05-23T01:09:47.236Z
   */
  @UpdateDateColumn()
  updated: Date

  @ApiHideProperty()
  @Exclude()
  @OneToMany(() => LangPermissions, (langPermissions) => langPermissions.lang)
  permissions: LangPermissions[]

  /**
   * Parts of speech for the language.
   */
  @OneToMany(() => PartOfSpeech, (partOfSpeech) => partOfSpeech.lang)
  partsOfSpeech: PartOfSpeech[]

  /**
   * Word classes for the language.
   */
  @OneToMany(() => WordClass, (wordClass) => wordClass.lang)
  wordClasses: WordClass[]

  /**
   * The user who owns the language.
   */
  owner: User

  /**
   * Any other users who are able to contribute to the language.
   */
  contributors: User[]

  @AfterLoad()
  updateOwnerAndContributors() {
    if (!this.permissions) return undefined
    this.owner = this.permissions.filter((perm) => perm.owner)[0]?.user
    this.contributors = this.permissions
      .filter((perm) => !perm.owner)
      .map((perm) => perm?.user)
  }
}
