import {ObjectType, Field} from 'type-graphql'
import { Entity,PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne } from 'typeorm';
import { User } from './User';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;



  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({type: "int", default: 0})
  votes!: number;


  @Field()
  @Column()
  creatorId: number

  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  creator: User

  @Field(() => String)
  @CreateDateColumn()
  createdAt :Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt :  Date;
}