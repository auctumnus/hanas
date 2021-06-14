import { Exclude } from 'class-transformer'
import { Lang } from '../../lang/entities/lang.entity'
import { User } from '../../user/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { PartOfSpeech } from '../../part-of-speech/entities/part-of-speech.entity'
import { WordClass } from '../../word-class/entities/word-class.entity'
import {ApiHideProperty, ApiProperty} from '@nestjs/swagger'

@Entity()
export class Word {
  @ApiHideProperty()
  @Exclude()
  @PrimaryGeneratedColumn()
  internal_id: number

  /**
   * The language that this word belongs to.
   */
  @ApiProperty()
  @Exclude()
  @ManyToOne(() => Lang, { onDelete: 'CASCADE' })
  lang: Lang

  /**
   * The user who made this word.
   */
  @ApiProperty()
  @ManyToOne(() => User)
  creator: User

  /**
   * The user who last updated this word.
   */
  @ApiProperty()
  @ManyToOne(() => User)
  lastUpdatedBy: User

  /**
   * The part of speech for this word.
   */
  @ApiProperty()
  @ManyToOne(() => PartOfSpeech, { onDelete: 'CASCADE' })
  partOfSpeech: PartOfSpeech

  /**
   * The word classes for this word.
   */
  @ApiProperty()
  @ManyToMany(() => WordClass, { onDelete: 'CASCADE' })
  @JoinTable()
  wordClasses: WordClass[]

  /**
   * The word in the language's orthography.
   * @example sus
   */
  @ApiProperty()
  @Column()
  word: string

  /**
   * The word represented in the International Phonetic Alphabet.
   * @example sʌs
   */
  @ApiProperty()
  @Column({ default: '' })
  ipa: string

  /**
   * The meaning of the word.
   * @example im just making an among us joke now
   */
  @ApiProperty()
  @Column({ default: '' })
  definition: string

  /**
   * Any notes about the word, e.g. usage or such.
   * @example when the impostor is sus or something
   */
  @ApiProperty()
  @Column({ default: '' })
  notes: string

  /**
   * When the word was created.
   * @example 2021-05-31T03:07:58.146Z
   */
  @ApiProperty()
  @CreateDateColumn()
  created: Date

  /**
   * When the word was last updated.
   * @example 2021-05-31T03:08:29.751Z
   */
  @ApiProperty()
  @UpdateDateColumn()
  updated: Date
}
