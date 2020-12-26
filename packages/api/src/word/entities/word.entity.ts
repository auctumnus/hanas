import { Exclude } from 'class-transformer'
import { Lang } from '../../lang/entities/lang.entity'
import { User } from '../../user/entities/user.entity'
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { PartOfSpeech } from 'src/part-of-speech/entities/part-of-speech.entity'

@Entity()
export class Word {
  @Exclude()
  @PrimaryGeneratedColumn()
  internal_id: number

  @ManyToOne(() => Lang)
  lang: Lang

  @ManyToOne(() => User)
  creator: User

  @OneToOne(() => PartOfSpeech)
  partOfSpeech: PartOfSpeech

  @Column()
  word: string

  @Column()
  ipa: string

  @Column()
  definition: string

  @Column()
  notes: string
}
