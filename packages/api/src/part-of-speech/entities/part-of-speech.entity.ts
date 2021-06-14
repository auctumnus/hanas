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
export class PartOfSpeech {
  @ApiHideProperty()
  @Exclude()
  @PrimaryGeneratedColumn()
  internal_id: number

  /**
   * The language this part of speech is for.
   */
  @ApiProperty()
  @ManyToOne(() => Lang, (lang) => lang.partsOfSpeech, { onDelete: 'CASCADE' })
  lang: Lang

  /**
   * The name of this part of speech.
   * @example Adjective
   */
  @ApiProperty()
  @Column()
  name: string

  /**
   * The abbreviation of this part of speech.
   * @example adj
   */
  @ApiProperty()
  @Column()
  abbreviation: string

  /**
   * The time this part of speech was made.
   * @example 2021-06-14T03:34:03.113Z
   */
  @ApiProperty()
  @CreateDateColumn()
  created: Date

  /**
   * The time this part of speech was last updated.
   * @example 2021-06-14T03:34:03.113Z
   */
  @ApiProperty()
  @UpdateDateColumn()
  updated: Date
}
