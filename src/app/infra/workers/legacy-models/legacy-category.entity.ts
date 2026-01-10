import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Legacy Category Entity from MySQL Database
 * Maps to the old 'categories' table structure
 */
@Entity('categories')
export class LegacyCategory {
  @PrimaryColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'icon_url', nullable: true })
  iconUrl: string;

  @Column({ name: 'created_at', nullable: true })
  createdAt: Date;

  @Column({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
