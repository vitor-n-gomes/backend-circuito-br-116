import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Business } from './business.entity';
import { Comment } from './comment.entity';
import { LastSeenBusiness } from './last-seen-business.entity';
import { SearchHistory } from './search-history.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('increment', { name: 'aux_id' })
  auxId: number;

  @Column({ type: 'uuid', unique: true, default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ name: 'auth_id', type: 'varchar', length: 100 })
  authId: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  picture: string;

  @Column({ name: 'is_anonymous', type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ name: 'accepted_terms_and_condition', type: 'boolean', default: false })
  acceptedTermsAndCondition: boolean;

  @Column({ name: 'device_fcm_token', type: 'varchar', nullable: true })
  deviceFCMToken: string;

  @Column({ type: 'jsonb', default: {} })
  identities: Record<string, string[]>;

  @Column({ name: 'allowed_notifications', type: 'jsonb', default: {} })
  allowedNotifications: Record<string, boolean>;

  @Column({ type: 'jsonb', default: {} })
  meta: Record<string, unknown>;

  @Column({ name: 'asset_id', type: 'uuid', nullable: true })
  assetId: string;

  @Column({ type: 'integer', default: 0 })
  coins: number;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ name: 'verification_requested_at', type: 'timestamp', nullable: true })
  verificationRequestedAt: Date;

  @Column({ name: 'location_pretty', type: 'varchar', length: 200, nullable: true })
  locationPretty: string;

  @Column({ name: 'location_lat', type: 'double precision', nullable: true })
  locationLat: number;

  @Column({ name: 'location_long', type: 'double precision', nullable: true })
  locationLong: number;

  @Column({ name: 'preferred_categories_ids', type: 'uuid', array: true, default: [] })
  preferredCategoriesIds: string[];

  @Column({ name: 'categories_setup_done', type: 'boolean', default: false })
  categoriesSetupDone: boolean;

  @Column({ name: 'blocked_accounts', type: 'varchar', array: true, nullable: true, default: [] })
  blockedAccounts: string[];

  @Column({ name: 'intro_done', type: 'boolean', default: false })
  introDone: boolean;

  @Column({ name: 'intro_skipped', type: 'boolean', default: false })
  introSkipped: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Business, (business) => business.account)
  businesses: Business[];

  @OneToMany(() => Comment, (comment) => comment.account)
  comments: Comment[];

  @OneToMany(() => LastSeenBusiness, (lastSeen) => lastSeen.account)
  lastSeenBusinesses: LastSeenBusiness[];

  @OneToMany(() => SearchHistory, (searchHistory) => searchHistory.account)
  searchHistories: SearchHistory[];
}
