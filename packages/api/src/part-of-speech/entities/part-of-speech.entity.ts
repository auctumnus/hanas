import { Lang } from 'src/lang/entities/lang.entity'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class PartOfSpeech {
  @PrimaryGeneratedColumn()
  internal_id: number

  @ManyToOne(() => Lang, (lang) => lang.partsOfSpeech)
  lang: Lang

  @Column()
  name: string

  @Column()
  abbreviation: string
}
