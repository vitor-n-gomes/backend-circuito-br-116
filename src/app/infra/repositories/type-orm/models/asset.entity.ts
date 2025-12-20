import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('assets')
export class Asset {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ type: 'integer' })
  aux_id: number;

  @Column({ type: 'varchar', length: 100 })
  path: string;

  @Column({ type: 'integer' })
  size: number;

  @Column({ name: 'initialName', type: 'varchar', nullable: true })
  initialName: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
