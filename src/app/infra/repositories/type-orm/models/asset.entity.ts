import { Entity, Column, PrimaryColumn, Generated, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity('assets')
export class Asset {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ name: 'aux_id', type: 'integer' })
  @Generated('increment')
  aux_id: number;

  @Column({ type: 'varchar', length: 100 })
  path: string;

  @Column({ type: 'integer' })
  size: number;

  @Column({ name: 'initialName', type: 'varchar', nullable: true })
  initialName: string;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
