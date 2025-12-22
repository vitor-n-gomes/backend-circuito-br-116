import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('BusinessController - Latest Businesses (e2e)', () => {
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

  describe('GET /businesses/latest', () => {
    it('should return an array of latest businesses with default limit', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/latest')
        .expect(200);

      // Verify response is an array
      expect(Array.isArray(res.body)).toBe(true);

      // Verify default limit (should return up to 12 businesses)
      expect(res.body.length).toBeLessThanOrEqual(12);

      // If there are results, verify the structure of the first business
      if (res.body.length > 0) {
        const business = res.body[0];

        // Verify required properties exist
        expect(business).toHaveProperty('auxId');
        expect(business).toHaveProperty('id');
        expect(business).toHaveProperty('title');
        expect(business).toHaveProperty('accountId');
        expect(business).toHaveProperty('categoryId');
        expect(business).toHaveProperty('locationPretty');
        expect(business).toHaveProperty('locationLat');
        expect(business).toHaveProperty('locationLong');
        expect(business).toHaveProperty('classification');
        expect(business).toHaveProperty('views');
        expect(business).toHaveProperty('isVerified');
        expect(business).toHaveProperty('createdAt');
        expect(business).toHaveProperty('updatedAt');

        // Verify data types
        expect(typeof business.auxId).toBe('number');
        expect(typeof business.id).toBe('string');
        expect(typeof business.title).toBe('string');
        expect(typeof business.views).toBe('number');
        expect(typeof business.isVerified).toBe('boolean');
        expect(typeof business.locationLat).toBe('number');
        expect(typeof business.locationLong).toBe('number');
      }
    });

    it('should return limited results when limit parameter is provided', async () => {
      const limit = 5;

      const res = await request(app.getHttpServer())
        .get('/businesses/latest')
        .query({ limit })
        .expect(200);

      // Verify response is an array
      expect(Array.isArray(res.body)).toBe(true);

      // Verify limit is respected
      expect(res.body.length).toBeLessThanOrEqual(limit);
    });

    it('should prioritize promoted businesses', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/latest')
        .query({ limit: 20 })
        .expect(200);

      // If there are promoted businesses, they should appear first
      if (res.body.length > 0) {
        const promotedBusinesses = res.body.filter(b => b.promotedAt !== null);
        const nonPromotedBusinesses = res.body.filter(b => b.promotedAt === null);

        if (promotedBusinesses.length > 0 && nonPromotedBusinesses.length > 0) {
          // Find the last promoted business index
          const lastPromotedIndex = res.body.findIndex((b, idx) => {
            return b.promotedAt !== null && 
                   (idx === res.body.length - 1 || res.body[idx + 1].promotedAt === null);
          });

          // Find the first non-promoted business index
          const firstNonPromotedIndex = res.body.findIndex(b => b.promotedAt === null);

          // Promoted businesses should come before non-promoted
          if (lastPromotedIndex !== -1 && firstNonPromotedIndex !== -1) {
            expect(lastPromotedIndex).toBeLessThan(firstNonPromotedIndex);
          }
        }
      }
    });

    it('should return businesses ordered by creation date (newest first)', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/latest')
        .query({ limit: 10 })
        .expect(200);

      if (res.body.length > 1) {
        // Filter out promoted businesses for this check, or check only non-promoted
        const nonPromotedBusinesses = res.body.filter(b => b.promotedAt === null);

        if (nonPromotedBusinesses.length > 1) {
          for (let i = 0; i < nonPromotedBusinesses.length - 1; i++) {
            const currentDate = new Date(nonPromotedBusinesses[i].createdAt);
            const nextDate = new Date(nonPromotedBusinesses[i + 1].createdAt);

            // Current business should be newer or equal to next business
            expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
          }
        }
      }
    });

    it('should handle limit of 0 gracefully', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/latest')
        .query({ limit: 0 })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      // Should return empty array or default behavior
      expect(res.body.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle very large limit values', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/latest')
        .query({ limit: 1000 })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      // Should return all available businesses up to database limit
      expect(res.body.length).toBeGreaterThanOrEqual(0);
    });
  });
});
