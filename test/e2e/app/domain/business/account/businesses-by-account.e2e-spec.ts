import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('BusinessController - Get Businesses by Account (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /businesses/account/:accountId', () => {
    it('should return businesses for a specific account', async () => {
      const accountId = 1; // Based on seed data, accounts 1-5 are used

      const res = await request(app.getHttpServer())
        .get(`/businesses/account/${accountId}`)
        .expect(200);

      // Verify pagination structure
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('limit');
      expect(res.body.meta).toHaveProperty('totalPages');

      // Verify data is an array
      expect(Array.isArray(res.body.data)).toBe(true);

      // If there are results, verify they all belong to the account
      if (res.body.data.length > 0) {
        res.body.data.forEach(business => {
          expect(business.accountId).toBe(accountId);
          expect(business).toHaveProperty('auxId');
          expect(business).toHaveProperty('id');
          expect(business).toHaveProperty('title');
          expect(business).toHaveProperty('categoryId');

          // Verify data types
          expect(typeof business.auxId).toBe('number');
          expect(typeof business.id).toBe('string');
          expect(typeof business.title).toBe('string');
          expect(typeof business.accountId).toBe('number');
        });
      }
    });

    it('should return paginated results with default values', async () => {
      const accountId = 2;

      const res = await request(app.getHttpServer())
        .get(`/businesses/account/${accountId}`)
        .expect(200);

      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(20);
      expect(res.body.data.length).toBeLessThanOrEqual(20);
    });

    it('should respect custom pagination parameters', async () => {
      const accountId = 1;
      const page = 1;
      const limit = 5;

      const res = await request(app.getHttpServer())
        .get(`/businesses/account/${accountId}`)
        .query({ page, limit })
        .expect(200);

      expect(res.body.meta.page).toBe(page);
      expect(res.body.meta.limit).toBe(limit);
      expect(res.body.data.length).toBeLessThanOrEqual(limit);
    });

    it('should return empty results for account with no businesses', async () => {
      const accountId = 9999; // Non-existent account

      const res = await request(app.getHttpServer())
        .get(`/businesses/account/${accountId}`)
        .expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
    });

    it('should handle second page correctly', async () => {
      const accountId = 1;
      const limit = 2;

      const res1 = await request(app.getHttpServer())
        .get(`/businesses/account/${accountId}`)
        .query({ page: 1, limit })
        .expect(200);

      if (res1.body.meta.totalPages > 1) {
        const res2 = await request(app.getHttpServer())
          .get(`/businesses/account/${accountId}`)
          .query({ page: 2, limit })
          .expect(200);

        expect(res2.body.meta.page).toBe(2);

        // Ensure different results on different pages
        if (res1.body.data.length > 0 && res2.body.data.length > 0) {
          expect(res1.body.data[0].id).not.toBe(res2.body.data[0].id);
        }
      }
    });

    it('should return businesses in consistent order', async () => {
      const accountId = 1;

      const res1 = await request(app.getHttpServer())
        .get(`/businesses/account/${accountId}`)
        .query({ limit: 10 })
        .expect(200);

      const res2 = await request(app.getHttpServer())
        .get(`/businesses/account/${accountId}`)
        .query({ limit: 10 })
        .expect(200);

      // Same request should return same order
      if (res1.body.data.length > 0 && res2.body.data.length > 0) {
        expect(res1.body.data[0].id).toBe(res2.body.data[0].id);
      }
    });

    it('should validate accountId parameter is a number', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/account/invalid')
        .expect(400);

      // Should return validation error
      expect(res.body).toHaveProperty('message');
    });

    it('should test multiple accounts have different businesses', async () => {
      const accountId1 = 1;
      const accountId2 = 2;

      const res1 = await request(app.getHttpServer())
        .get(`/businesses/account/${accountId1}`)
        .expect(200);

      const res2 = await request(app.getHttpServer())
        .get(`/businesses/account/${accountId2}`)
        .expect(200);

      // If both have results, verify they're different accounts
      if (res1.body.data.length > 0 && res2.body.data.length > 0) {
        expect(res1.body.data[0].accountId).toBe(accountId1);
        expect(res2.body.data[0].accountId).toBe(accountId2);
        expect(res1.body.data[0].accountId).not.toBe(res2.body.data[0].accountId);
      }
    });
  });
});
