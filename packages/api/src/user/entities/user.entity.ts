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

@Entity()
export class User {
  @Exclude()
  @PrimaryGeneratedColumn()
  internal_id: number

  @Column({ unique: true })
  username: string

  @Column()
  display_name: string

  @Column({ default: '' })
  profile_picture: string

  @Column({ default: '' })
  banner: string

  @Exclude()
  @Column()
  password_hash: string

  @CreateDateColumn()
  created: Date

  @UpdateDateColumn()
  updated: Date

  @Exclude()
  @OneToMany(() => LangPermissions, (langPermissions) => langPermissions.user)
  langPermissions: LangPermissions[]

  ownedLangs: Lang[]
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
