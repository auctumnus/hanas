import { User } from '../../user/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm'
import { Exclude } from 'class-transformer'
import {ApiHideProperty, ApiProperty} from '@nestjs/swagger'

@Entity()
export class Session {
  /**
   * The ID of this session.
   * @example 8aehKMepE0Wj-GVD-oemO
   */
  @ApiProperty()
  @PrimaryColumn()
  id: string

  /**
   * The user who is logged in through this session.
   */
  @ApiProperty()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User

  @ApiHideProperty()
  @ApiProperty()
  @Exclude()
  @Column()
  hash: string

  /**
   * The OS of the request that made this session. May not be accurate.
   * @example Windows
   */
  @ApiProperty()
  @Column()
  os: string

  /**
   * The browser of the request that made this session. May not be accurate.
   * @example Chrome
   */
  @ApiProperty()
  @Column()
  browser: string

  /**
   * When this session was created.
   */
  @ApiProperty()
  @CreateDateColumn()
  created: Date
}
