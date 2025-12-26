import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Generated } from 'typeorm';
import { Business } from './business.entity';
import { Comment } from './comment.entity';
import { LastSeenBusiness } from './last-seen-business.entity';
import { SearchHistory } from './search-history.entity';
import { Asset } from './asset.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  authId: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  isAnonymous: boolean;

  @Column({ type: 'json', nullable: true })
  identities: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceFCMToken: string;

  @Column({ type: 'text', nullable: true })
  picture: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  acceptedTermsAndCondition: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  introDone: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  introSkipped: boolean;

  @Column({ type: 'uuid', nullable: true })
  assetId: string;

  @Column({ type: 'jsonb', default: {}, nullable: true })
  meta: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  allowedNotifications: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'varchar', length: 255, array: true, default: () => 'ARRAY[]::character varying(255)[]', nullable: true })
  blockedAccounts: string[];

  @Column({ type: 'uuid', array: true, default: () => 'ARRAY[]::uuid[]', nullable: true })
  preferredCategoriesIds: string[];

  @Column({ type: 'boolean', default: false, nullable: true })
  categoriesSetupDone: boolean;

  @Column({ type: 'integer', default: 0, nullable: true })
  coins: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  locationPretty: string;

  @Column({ type: 'float8', nullable: true })
  locationLat: number;

  @Column({ type: 'json', nullable: true })
  locationLong: any;

  @Column({ type: 'boolean', default: false, nullable: true })
  verified: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  verificationRequestedAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phone: string;

  @Column({ type: 'uuid', nullable: true })
  selectedCurrencyId: string;

  @Column({ type: 'integer', generated: 'increment' })
  aux_id: number;

  @OneToMany(() => Business, (business) => business.account)
  businesses: Business[];

  @OneToMany(() => Comment, (comment) => comment.account)
  comments: Comment[];

  @OneToMany(() => LastSeenBusiness, (lastSeen) => lastSeen.account)
  lastSeenBusinesses: LastSeenBusiness[];

  @OneToMany(() => SearchHistory, (searchHistory) => searchHistory.account)
  searchHistories: SearchHistory[];
}

