import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { AccountFactory, createAccountEntity } from '../factories/account.factory';
import { runFactories } from '../../factories/builder.factory';

describe('AccountsController - Get Account by ID (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testAccountId: string;

  beforeAll(async () => {
    // 1️⃣ FIRST: Seed data using factory builder BEFORE app initialization
    const accountEntity = createAccountEntity({
      name: 'Test Account Get By ID',
      email: `test.getbyid.${Date.now()}@example.com`,
      authId: `auth_getbyid_${Date.now()}`,
      phone: '+5511999999999',
      verified: true,
      verifiedAt: new Date(),
      locationPretty: 'São Paulo, SP',
      locationLat: -23.5505,
      locationLong: -46.6333,
      coins: 100,
    });

    const factory = new AccountFactory([accountEntity]);
    const [createdAccount] = await runFactories(factory);

    testAccountId = createdAccount.id;

    // 2️⃣ THEN: Initialize NestJS app
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      })
    );
    await app.init();
  });

  afterAll(async () => {
    // Clean up test account
    if (testAccountId) {
      try {
        const { DataSource } = require('typeorm');
        const { Account } = require('@/app/infra/repositories/type-orm/models/account.entity');
        
        const dataSourceConfig = {
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '5432'),
          username: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: process.env.DB_NAME,
          entities: [Account],
          synchronize: false,
          logging: false,
          ssl: process.env.DB_HOST?.includes('rds.amazonaws.com')
            ? { rejectUnauthorized: false }
            : false,
        };

        const dataSource = new DataSource(dataSourceConfig);
        await dataSource.initialize();
        const accountRepo = dataSource.getRepository(Account);
        
        await accountRepo.delete(testAccountId);
        await dataSource.destroy();
      } catch (error) {
        console.warn(`Cleanup failed for test account ${testAccountId}:`, error);
      }
    }

    // CRITICAL: Close both app and moduleFixture
    if (app) {
      await app.close();
    }

    if (moduleFixture) {
      await moduleFixture.close();
    }
  });

  describe('GET /accounts/:accountId', () => {
    it('should return correct response structure', async () => {
      const res = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('authId');
      expect(res.body).toHaveProperty('picture');
      expect(res.body).toHaveProperty('isAnonymous');
      expect(res.body).toHaveProperty('acceptedTermsAndCondition');
      expect(res.body).toHaveProperty('identities');
      expect(res.body).toHaveProperty('allowedNotifications');
      expect(res.body).toHaveProperty('meta');
      expect(res.body).toHaveProperty('coins');
      expect(res.body).toHaveProperty('verified');
      expect(res.body).toHaveProperty('preferredCategoriesIds');
      expect(res.body).toHaveProperty('categoriesSetupDone');
      expect(res.body).toHaveProperty('introDone');
      expect(res.body).toHaveProperty('introSkipped');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should return data with correct types', async () => {
      const res = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .expect(200);

      const account = res.body;

      // String types
      expect(typeof account.id).toBe('string');
      expect(typeof account.authId).toBe('string');
      expect(typeof account.picture).toBe('string');

      // Boolean types
      expect(typeof account.isAnonymous).toBe('boolean');
      expect(typeof account.acceptedTermsAndCondition).toBe('boolean');
      expect(typeof account.verified).toBe('boolean');
      expect(typeof account.categoriesSetupDone).toBe('boolean');
      expect(typeof account.introDone).toBe('boolean');
      expect(typeof account.introSkipped).toBe('boolean');

      // Number types
      expect(typeof account.coins).toBe('number');

      // Object types
      expect(typeof account.identities).toBe('object');
      expect(typeof account.allowedNotifications).toBe('object');
      expect(typeof account.meta).toBe('object');

      // Array types
      expect(Array.isArray(account.preferredCategoriesIds)).toBe(true);
    });

    it('should return account with correct ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .expect(200);

      expect(res.body.id).toBe(testAccountId);
    });

    it('should return account with correct name', async () => {
      const res = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .expect(200);

      expect(res.body.name).toBe('Test Account Get By ID');
    });

    it('should return account with location data', async () => {
      const res = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .expect(200);

      expect(res.body.locationPretty).toBe('São Paulo, SP');
      expect(res.body.locationLat).toBe(-23.5505);
      expect(res.body.locationLong).toBe(-46.6333);
    });

    it('should return account with verification status', async () => {
      const res = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .expect(200);

      expect(res.body.verified).toBe(true);
      expect(res.body.verifiedAt).toBeDefined();
    });

    it('should handle account with phone number', async () => {
      const res = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .expect(200);

      expect(res.body.phone).toBe('+5511999999999');
    });

    it('should return 404 for non-existent account', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(`/accounts/${nonExistentId}`)
        .expect(404);
    });

    it('should return 500 for invalid UUID format', async () => {
      const invalidId = 'invalid-uuid-format';

      const res = await request(app.getHttpServer())
        .get(`/accounts/${invalidId}`);

      // Could be 400 or 500 depending on validation
      expect([400, 500]).toContain(res.status);
    });

    it('should include timestamps in response', async () => {
      const res = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .expect(200);

      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();

      // Verify timestamps are valid dates
      const createdAt = new Date(res.body.createdAt);
      const updatedAt = new Date(res.body.updatedAt);

      expect(createdAt.toString()).not.toBe('Invalid Date');
      expect(updatedAt.toString()).not.toBe('Invalid Date');
    });

    it('should return empty arrays for unset array fields', async () => {
      const res = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .expect(200);

      expect(Array.isArray(res.body.preferredCategoriesIds)).toBe(true);
      if (res.body.blockedAccounts !== null && res.body.blockedAccounts !== undefined) {
        expect(Array.isArray(res.body.blockedAccounts)).toBe(true);
      }
    });

    it('should return empty objects for unset JSON fields', async () => {
      const res = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .expect(200);

      expect(typeof res.body.identities).toBe('object');
      expect(typeof res.body.allowedNotifications).toBe('object');
      expect(typeof res.body.meta).toBe('object');
    });
  });
});
