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
import {ApiHideProperty, ApiProperty} from '@nestjs/swagger'

@Entity()
export class WordClass {
  @ApiHideProperty()
  @Exclude()
  @PrimaryGeneratedColumn()
  internal_id: number

  /**
   * The language the word belongs to.
   */
  @ManyToOne(() => Lang, (lang) => lang.wordClasses, { onDelete: 'CASCADE' })
  lang: Lang

  /**
   * The name of the word class.
   * @example Strong Adjective
   */
  @ApiProperty({ example: 'Strong Adjective' })
  @Column()
  name: string

  /**
   * The abbreviation for the word class.
   * @example str
   */
  @Column()
  abbreviation: string

  /**
   * When the word class was created.
   */
  @CreateDateColumn()
  created: Date

  /**
   * When the word class was last updated.
   */
  @UpdateDateColumn()
  updated: Date
}
