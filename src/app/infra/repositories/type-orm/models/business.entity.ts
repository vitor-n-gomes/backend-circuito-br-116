import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';
import { Category } from './category.entity';

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn({name: 'aux_id' })
  auxId: number;

  @Column({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ name: 'accountId', type: 'integer' })
  accountId: number;

  @Column({ name: 'locationId', type: 'integer' })
  locationId: number;

  @Column({ name: 'locationPretty', type: 'varchar', length: 100 })
  locationPretty: string;

  @Column({ name: 'locationLat', type: 'float' })
  locationLat: number;

  @Column({ name: 'locationLong', type: 'float' })
  locationLong: number;

  @Column({ type: 'varchar', length: 180 })
  title: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string;

  @Column({ type: 'integer', default: 0 })
  views: number;

  @Column({ name: 'isVerified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'phoneNumber', type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ name: 'promotedAt', type: 'timestamp', nullable: true })
  promotedAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  whatsapp: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  facebook: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  instagram: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tiktok: string;

  @Column({ name: 'category_id', type: 'integer' })
  categoryId: number;

  @Column({ type: 'varchar', length: 2 })
  classification: string;

  @Column({ type: 'jsonb', nullable: true })
  vectors: Record<string, number[]>;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @ManyToOne(() => Account, (account) => account.businesses)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @ManyToOne(() => Category, (category) => category.businesses)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
