import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity('search_history')
export class SearchHistory {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ name: 'accountId', type: 'uuid' })
  accountId: string;

  @Column({ name: 'searchKey', type: 'varchar' })
  searchKey: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ name: 'entityId', type: 'uuid', nullable: true })
  entityId: string;

  @Column({ type: 'text', nullable: true })
  data: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @ManyToOne(() => Account, (account) => account.searchHistories)
  @JoinColumn({ name: 'accountId' })
  account: Account;
}
