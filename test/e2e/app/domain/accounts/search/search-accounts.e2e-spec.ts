import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { AccountFactory, createAccountEntity } from '../factories/account.factory';
import { runFactories } from '../../factories/builder.factory';

describe('AccountsController - Search Accounts (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testAccountIds: string[] = [];

  beforeAll(async () => {
    // 1️⃣ FIRST: Seed data using factory builder BEFORE app initialization
    const timestamp = Date.now();
    const accountEntities = [
      createAccountEntity({
        name: `John Doe Search ${timestamp}`,
        email: `john.search.${timestamp}@example.com`,
        authId: `auth_john_${timestamp}`,
      }),
      createAccountEntity({
        name: `Jane Smith Search ${timestamp}`,
        email: `jane.search.${timestamp}@example.com`,
        authId: `auth_jane_${timestamp}`,
      }),
      createAccountEntity({
        name: `Bob Johnson Search ${timestamp}`,
        email: `bob.search.${timestamp}@example.com`,
        authId: `auth_bob_${timestamp}`,
      }),
    ];

    const factory = new AccountFactory(accountEntities);
    const createdAccounts = await runFactories(factory);
    testAccountIds = createdAccounts.map(account => account.id);

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
    // Clean up test accounts
    if (testAccountIds.length > 0) {
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
        
        await accountRepo.delete(testAccountIds);
        await dataSource.destroy();
      } catch (error) {
        console.warn(`Cleanup failed for test accounts:`, error);
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

  describe('POST /accounts/search', () => {
    it('should return correct response structure', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts/search')
        .send({ keyword: 'Search' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return data with correct types', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts/search')
        .send({ keyword: 'Search' })
        .expect(200);

      if (res.body.length > 0) {
        const account = res.body[0];
        
        expect(account).toHaveProperty('id');
        expect(account).toHaveProperty('name');
        expect(account).toHaveProperty('authId');
        expect(account).toHaveProperty('picture');
        expect(account).toHaveProperty('isAnonymous');
        expect(account).toHaveProperty('acceptedTermsAndCondition');
        expect(account).toHaveProperty('coins');
        expect(account).toHaveProperty('verified');
        expect(account).toHaveProperty('createdAt');
        expect(account).toHaveProperty('updatedAt');

        // Validate types
        expect(typeof account.id).toBe('string');
        expect(typeof account.authId).toBe('string');
        expect(typeof account.isAnonymous).toBe('boolean');
        expect(typeof account.acceptedTermsAndCondition).toBe('boolean');
        expect(typeof account.coins).toBe('number');
        expect(typeof account.verified).toBe('boolean');
      }
    });

    it('should search by name keyword', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts/search')
        .send({ keyword: 'John Doe' })
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      const found = res.body.some(account => 
        account.name.includes('John Doe')
      );
      expect(found).toBe(true);
    });

    it('should search by partial name', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts/search')
        .send({ keyword: 'Jane' })
        .expect(200);

      if (res.body.length > 0) {
        const found = res.body.some(account => 
          account.name.toLowerCase().includes('jane')
        );
        expect(found).toBe(true);
      }
    });

    it('should search by email keyword', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts/search')
        .send({ keyword: 'search' })
        .expect(200);

      if (res.body.length > 0) {
        const found = res.body.some(account => 
          account.email?.toLowerCase().includes('search')
        );
        expect(found).toBe(true);
      }
    });

    it('should return paginated results with default values', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts/search')
        .send({ keyword: 'Search' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(5); // Default perPage is 5
    });

    it('should respect custom pagination parameters', async () => {
      const page = 1;
      const perPage = 2;

      const res = await request(app.getHttpServer())
        .post('/accounts/search')
        .send({ 
          keyword: 'Search',
          page,
          perPage 
        })
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(perPage);
    });

    it('should return empty array for non-matching keyword', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts/search')
        .send({ keyword: 'NonExistentKeyword123456789XYZ' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should handle case-insensitive search', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts/search')
        .send({ keyword: 'SEARCH' })
        .expect(200);

      if (res.body.length > 0) {
        const found = res.body.some(account => 
          account.name?.toLowerCase().includes('search')
        );
        expect(found).toBe(true);
      }
    });

    it('should reject request without keyword', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts/search')
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('message');
      expect(Array.isArray(res.body.message)).toBe(true);
    });

    it('should reject invalid page number', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts/search')
        .send({ 
          keyword: 'test',
          page: 0 
        })
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should reject invalid perPage number', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts/search')
        .send({ 
          keyword: 'test',
          perPage: 0 
        })
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should return different data on different pages', async () => {
      const page1Res = await request(app.getHttpServer())
        .post('/accounts/search')
        .send({ 
          keyword: 'Search',
          page: 1,
          perPage: 1
        })
        .expect(200);

      const page2Res = await request(app.getHttpServer())
        .post('/accounts/search')
        .send({ 
          keyword: 'Search',
          page: 2,
          perPage: 1
        })
        .expect(200);

      if (page1Res.body.length > 0 && page2Res.body.length > 0) {
        expect(page1Res.body[0].id).not.toBe(page2Res.body[0].id);
      }
    });
  });
});
