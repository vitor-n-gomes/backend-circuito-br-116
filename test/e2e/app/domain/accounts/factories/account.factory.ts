import { DataSource } from 'typeorm';
import { Account } from '@/app/infra/repositories/type-orm/models/account.entity';
import { FactoryBuilder } from '../../factories/builder.factory';

/**
 * Factory for creating Account entities in the database
 * Implements FactoryBuilder pattern for consistent test data seeding
 */
export class AccountFactory implements FactoryBuilder {
  entities: Partial<Account>[];
  
  constructor(entities: Partial<Account>[]) {
    this.entities = entities;
  }

  async run(dataSource: DataSource): Promise<Account[]> {
    const accountRepo = dataSource.getRepository(Account);

    // CRITICAL: Explicitly set timestamps for entities
    // TypeORM decorators alone may not populate these reliably
    const entitiesWithTimestamps = this.entities.map(entity => ({
      ...entity,
      createdAt: entity.createdAt || new Date(),
      updatedAt: new Date(),
    }));

    const savedEntities = await accountRepo.save(entitiesWithTimestamps);
    
    console.log(`✅ Factory created ${savedEntities.length} account(s) successfully!`);
    
    return savedEntities;
  }
}

/**
 * Helper interface for creating account payloads
 */
export interface CreateAccountOptions {
  name?: string;
  authId?: string;
  email?: string;
  phone?: string;
  picture?: string;
  isAnonymous?: boolean;
  acceptedTermsAndCondition?: boolean;
  deviceFCMToken?: string;
  identities?: Record<string, string[]>;
  allowedNotifications?: Record<string, boolean>;
  meta?: Record<string, unknown>;
  assetId?: string;
  coins?: number;
  verified?: boolean;
  verifiedAt?: Date;
  verificationRequestedAt?: Date;
  locationPretty?: string;
  locationLat?: number;
  locationLong?: any;
  preferredCategoriesIds?: string[];
  categoriesSetupDone?: boolean;
  blockedAccounts?: string[];
  introDone?: boolean;
  introSkipped?: boolean;
}

/**
 * Creates a valid account payload with smart defaults
 * Override any field as needed for specific test cases
 * 
 * @param options - Optional fields to override defaults
 * @returns Complete account payload ready for API requests
 * 
 * @example
 * // Minimal usage with all defaults
 * const account = createAccountPayload();
 * 
 * @example
 * // Override specific fields
 * const account = createAccountPayload({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   verified: true
 * });
 */
export function createAccountPayload(
  options: CreateAccountOptions = {}
): Record<string, any> {
  const timestamp = Date.now();

  return {
    name: options.name ?? `Test User ${timestamp}`,
    authId: options.authId ?? `auth_${timestamp}`,
    email: options.email ?? `test_${timestamp}@example.com`,
    phone: options.phone ?? undefined,
    picture: options.picture ?? `https://example.com/avatar_${timestamp}.png`,
    isAnonymous: options.isAnonymous ?? false,
    acceptedTermsAndCondition: options.acceptedTermsAndCondition ?? false,
    deviceFCMToken: options.deviceFCMToken ?? undefined,
    identities: options.identities ?? {},
    allowedNotifications: options.allowedNotifications ?? {},
    meta: options.meta ?? {},
    assetId: options.assetId ?? undefined,
    coins: options.coins ?? 0,
    verified: options.verified ?? false,
    verifiedAt: options.verifiedAt ?? undefined,
    verificationRequestedAt: options.verificationRequestedAt ?? undefined,
    locationPretty: options.locationPretty ?? undefined,
    locationLat: options.locationLat ?? undefined,
    locationLong: options.locationLong ?? undefined,
    preferredCategoriesIds: options.preferredCategoriesIds ?? [],
    categoriesSetupDone: options.categoriesSetupDone ?? false,
    blockedAccounts: options.blockedAccounts ?? [],
    introDone: options.introDone ?? false,
    introSkipped: options.introSkipped ?? false,
  };
}

/**
 * Creates a minimal valid account (only required fields)
 * Useful for testing edge cases and validation
 */
export function createMinimalAccountPayload(): Record<string, any> {
  const timestamp = Date.now();
  
  return {
    name: `Minimal User ${timestamp}`,
    authId: `auth_minimal_${timestamp}`,
  };
}

/**
 * Creates account data for database seeding
 * Use this with AccountFactory for creating test data directly in the database
 * 
 * @example
 * const accountData = createAccountEntity({ name: 'Test User' });
 * const factory = new AccountFactory([accountData]);
 * const [created] = await runFactories(factory);
 */
export function createAccountEntity(options: CreateAccountOptions = {}): Partial<Account> {
  const timestamp = Date.now();
  
  const entity: Partial<Account> = {
    name: options.name ?? `Test User ${timestamp}`,
    authId: options.authId ?? `auth_${timestamp}`,
    email: options.email ?? `test_${timestamp}@example.com`,
    phone: options.phone ?? undefined,
    picture: options.picture ?? `https://example.com/avatar_${timestamp}.png`,
    isAnonymous: options.isAnonymous ?? false,
    acceptedTermsAndCondition: options.acceptedTermsAndCondition ?? false,
    deviceFCMToken: options.deviceFCMToken ?? undefined,
    identities: options.identities ?? {},
    allowedNotifications: options.allowedNotifications ?? {},
    meta: options.meta ?? {},
    assetId: options.assetId ?? undefined,
    coins: options.coins ?? 0,
    verified: options.verified ?? false,
    verifiedAt: options.verifiedAt ?? undefined,
    verificationRequestedAt: options.verificationRequestedAt ?? undefined,
    locationPretty: options.locationPretty ?? undefined,
    locationLat: options.locationLat ?? undefined,
    locationLong: options.locationLong ?? undefined,
    preferredCategoriesIds: options.preferredCategoriesIds ?? [],
    categoriesSetupDone: options.categoriesSetupDone ?? false,
    blockedAccounts: options.blockedAccounts ?? [],
    introDone: options.introDone ?? false,
    introSkipped: options.introSkipped ?? false,
  };
  
  // Don't set createdAt/updatedAt here - factory handles it
  // Don't set authId - the column doesn't exist in production DB
  
  return entity;
}

/**
 * Creates account with verification requested
 * Useful for testing verification scenarios
 */
export function createAccountWithVerificationRequested(): Record<string, any> {
  return createAccountPayload({
    verified: false,
    verificationRequestedAt: new Date(),
  });
}

/**
 * Creates verified account
 * Useful for testing verified user features
 */
export function createVerifiedAccount(): Record<string, any> {
  const now = new Date();
  return createAccountPayload({
    verified: true,
    verifiedAt: now,
  });
}

/**
 * Creates account with location data
 * Useful for testing location-based features
 */
export function createAccountWithLocation(): Record<string, any> {
  return createAccountPayload({
    locationPretty: 'São Paulo, SP',
    locationLat: -23.5505,
    locationLong: -46.6333,
  });
}

/**
 * Creates anonymous account
 * Useful for testing anonymous user behavior
 */
export function createAnonymousAccount(): Record<string, any> {
  const timestamp = Date.now();
  return createAccountPayload({
    name: null,
    email: null,
    isAnonymous: true,
    authId: `anon_auth_${timestamp}`,
  });
}
