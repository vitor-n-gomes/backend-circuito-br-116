import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  aux_id: number;

  @Column({ type: 'uuid', default: () => 'gen_random_uuid()', unique: true })
  id: string;

  @Column({ name: 'parentCategoryId', type: 'uuid', nullable: true })
  parentCategoryId: string;

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

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'parentCategoryId' })
  parentCategory: Category;
}
