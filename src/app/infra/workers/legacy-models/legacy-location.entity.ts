import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Legacy Location Entity from MySQL Database
 * Maps to the old 'locations' table structure
 */
@Entity('locations')
export class LegacyLocation {
  @PrimaryColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ name: 'created_at', nullable: true })
  createdAt: Date;

  @Column({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
