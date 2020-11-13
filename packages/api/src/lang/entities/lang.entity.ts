import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Lang {
  @PrimaryGeneratedColumn()
  internal_id: number

  @Column({ unique: true, length: 5 })
  id: string

  @Column({ length: 32 })
  name: string

  @Column({ length: 1000, default: '' })
  description: string

  @CreateDateColumn()
  created: Date

  @UpdateDateColumn()
  updated: Date
}
