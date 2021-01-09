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

  @OneToMany(() => PartOfSpeech, (partOfSpeech) => partOfSpeech.lang)
  partsOfSpeech: PartOfSpeech[]

  @OneToMany(() => WordClass, (wordClass) => wordClass.lang)
  wordClasses: WordClass[]

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
