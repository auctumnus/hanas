import { Exclude } from 'class-transformer'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
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
}
