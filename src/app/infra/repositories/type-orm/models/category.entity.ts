import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Asset } from './asset.entity';
import { Business } from './business.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  aux_id: number;

  @Column({ type: 'uuid', default: () => 'gen_random_uuid()', unique: true })
  id: string;

  @Column({ type: 'jsonb' })
  name: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, string>;

  @Column({ type: 'varchar', nullable: true })
  icon: string;

  @Column({ name: 'assetId', type: 'uuid', nullable: true })
  assetId: string;

  @Column({ name: 'remoteIconUrl', type: 'varchar', nullable: true })
  remoteIconUrl: string;

  @Column({ type: 'float', array: true, nullable: true, default: [] })
  vector: number[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @OneToOne(() => Asset, { nullable: true })
  @JoinColumn({ name: 'assetId' })
  asset: Asset;

  @OneToMany(() => Business, (business) => business.category)
  businesses: Business[];
}
