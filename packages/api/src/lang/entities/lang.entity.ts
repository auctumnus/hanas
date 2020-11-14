import { Exclude } from 'class-transformer'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

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
}
