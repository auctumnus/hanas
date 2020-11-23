import { User } from '../../user/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm'
import { Exclude } from 'class-transformer'

@Entity()
export class Session {
  @PrimaryColumn()
  id: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User

  @Exclude()
  @Column()
  hash: string

  @Column()
  os: string

  @Column()
  browser: string

  @CreateDateColumn()
  created: Date
}
