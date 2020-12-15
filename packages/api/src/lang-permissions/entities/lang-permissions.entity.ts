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

@Entity()
export class LangPermissions {
  @Exclude()
  @PrimaryGeneratedColumn()
  internal_id: number

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User

  @ManyToOne(() => Lang, (lang) => lang.permissions, { onDelete: 'CASCADE' })
  lang: Lang

  @Column({ default: false })
  owner: boolean

  @Column({ default: false })
  changePermissions: boolean

  @Column({ default: false })
  changeId: boolean

  @Column({ default: false })
  changeInfo: boolean

  @Column({ default: false })
  changeWords: boolean

  @CreateDateColumn()
  created: Date

  @UpdateDateColumn()
  updated: Date
}
