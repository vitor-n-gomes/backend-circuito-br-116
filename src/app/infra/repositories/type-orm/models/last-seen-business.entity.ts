import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity('last_seen_businesses')
export class LastSeenBusiness {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ type: 'integer' })
  aux_id: number;

  @Column({ name: 'accountId', type: 'integer' })
  accountId: number;

  @Column({ name: 'businessId', type: 'uuid' })
  businessId: string;

  @Column({ name: 'lastSeenAt', type: 'timestamp' })
  lastSeenAt: Date;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @ManyToOne(() => Account, (account) => account.lastSeenBusinesses)
  @JoinColumn({ name: 'accountId' })
  account: Account;
}
