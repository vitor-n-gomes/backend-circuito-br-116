import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity('comments')
export class Comment {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ type: 'integer' })
  aux_id: number;

  @Column({ name: 'accountId', type: 'uuid' })
  accountId: string;

  @Column({ name: 'auctionId', type: 'uuid', nullable: true })
  auctionId: string;

  @Column({ name: 'businessId', type: 'uuid', nullable: true })
  businessId: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'parentCommentId', type: 'uuid', nullable: true })
  parentCommentId: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @ManyToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'parentCommentId' })
  parentComment: Comment;

  @ManyToOne(() => Account, (account) => account.comments)
  @JoinColumn({ name: 'accountId' })
  account: Account;
}
