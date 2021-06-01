import { Exclude } from 'class-transformer'
import { LangPermissions } from '../../lang-permissions/entities/lang-permissions.entity'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  AfterLoad,
} from 'typeorm'
import { Lang } from '../../lang/entities/lang.entity'
import {ApiHideProperty} from '@nestjs/swagger'

@Entity()
export class User {
  @ApiHideProperty()
  @Exclude()
  @PrimaryGeneratedColumn()
  internal_id: number
  
  /**
   * The username of the user, which is the primary key for finding them.
   * @example alice
   */
  @Column({ unique: true })
  username: string

  /**
   * The name that the user would prefer to be displayed. Can contain anything,
   * although it is .trim()ed. OpenAPI just does not seem to enjoy a space
   * here, for some reason?
   * @example AliceSmith
   */
  @Column()
  display_name: string

  /**
   * A link to the image for the profile picture of this user. By default, the
   * image is 400 pixels square at maximum, but can be any aspect ratio or size
   * within that. If the profile picture is bigger than that, it'll crop it using
   * sharp's cover fit resize, which, if the docs are to be believed, should
   * be equivalent to the CSS `object-fit: cover; object-position: center;`
   * @example https://my-bucket.s3.us-west-2.amazonaws.com/YhEcI1URMGimpoyAav9Zp
   */
  @Column({ default: '' })
  profile_picture: string

  /**
   * A link to the image for the banner of this user. See the profile_picture
   * attribute for more info on resizing - the maximum size by default is 500px
   * high by 1500px wide.
   * @example https://my-bucket.s3.us-west-2.amazonaws.com/2F-oOC5ejzZuCZdp01OWS
   */
  @Column({ default: '' })
  banner: string

  @ApiHideProperty()
  @Exclude()
  @Column()
  password_hash: string

  /**
   * The timestamp for when the user was created.
   * @example 2021-05-31T03:07:58.146Z
   */
  @CreateDateColumn()
  created: Date

  /**
   * The timestamp for when the user's information was last updated.
   * @example 2021-05-31T03:08:29.751Z
   */
  @UpdateDateColumn()
  updated: Date

  @ApiHideProperty()
  @Exclude()
  @OneToMany(() => LangPermissions, (langPermissions) => langPermissions.user)
  langPermissions: LangPermissions[]

  /**
   * The languages which this user owns.
   */
  ownedLangs: Lang[]

  /**
   * The languages which this user is able to contribute to.
   */
  contributedLangs: Lang[]

  @AfterLoad()
  updateLangs() {
    if (!this.langPermissions) return undefined
    this.ownedLangs = this.langPermissions
      .filter((perm) => perm.owner)
      .map((perm) => perm.lang)
    this.contributedLangs = this.langPermissions
      .filter((perm) => !perm.owner)
      .map((perm) => perm.lang)
  }
}
