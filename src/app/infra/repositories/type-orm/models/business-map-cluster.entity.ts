import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('business_map_clusters')
export class BusinessMapCluster {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ name: 'aux_id', type: 'integer' })
  auxId: number;

  @Column({ name: 'locationLat', type: 'float' })
  locationLat: number;

  @Column({ name: 'locationLong', type: 'float' })
  locationLong: number;

  @Column({ type: 'jsonb' })
  meta: Record<string, unknown>;

  @Column({ name: 'expiresAt', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
