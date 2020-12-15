import { Exclude } from 'class-transformer'
import { LangPermissions } from '../../lang-permissions/entities/lang-permissions.entity'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'

@Entity()
export class User {
  @Exclude()
  @PrimaryGeneratedColumn()
  internal_id: number

  @Column({ unique: true })
  username: string

  @Column()
  display_name: string

  @Exclude()
  @Column()
  password_hash: string

  @CreateDateColumn()
  created: Date

  @UpdateDateColumn()
  updated: Date

  @OneToMany(() => LangPermissions, (langPermissions) => langPermissions.user)
  langPermissions: LangPermissions[]
}
