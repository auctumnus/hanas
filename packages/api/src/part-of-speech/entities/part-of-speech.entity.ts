import { Lang } from '../../lang/entities/lang.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Exclude } from 'class-transformer'

@Entity()
export class PartOfSpeech {
  @Exclude()
  @PrimaryGeneratedColumn()
  internal_id: number

  @ManyToOne(() => Lang, (lang) => lang.partsOfSpeech, { onDelete: 'CASCADE' })
  lang: Lang

  @Column()
  name: string

  @Column()
  abbreviation: string

  @CreateDateColumn()
  created: Date

  @UpdateDateColumn()
  updated: Date
}
