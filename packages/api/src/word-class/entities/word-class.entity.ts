import { Exclude } from 'class-transformer'
import { Lang } from '../../lang/entities/lang.entity'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class WordClass {
  @Exclude()
  @PrimaryGeneratedColumn()
  internal_id: number

  @ManyToOne(() => Lang)
  @Column()
  name: string

  @Column()
  abbreviation: string
}
