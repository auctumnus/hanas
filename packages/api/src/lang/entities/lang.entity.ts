import { Exclude } from 'class-transformer'
import { User } from 'src/user/entities/user.entity'
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

@Entity()
export class Lang {
  @Exclude()
  @PrimaryGeneratedColumn()
  internal_id: number

  @Column({ unique: true, length: 5 })
  id: string

  @Column()
  name: string

  @Column({ default: '' })
  description: string

  @CreateDateColumn()
  created: Date

  @UpdateDateColumn()
  updated: Date

  @Exclude()
  @OneToMany(() => LangPermissions, (langPermissions) => langPermissions.lang)
  permissions: LangPermissions[]

  owner: User
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
