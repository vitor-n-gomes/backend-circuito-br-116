import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('BusinessController - Filter Businesses (e2e)', () => {
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

  describe('POST /businesses/filter', () => {
    it('should return all businesses with empty filter', async () => {
      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({})
        .expect(200);

      // Verify pagination structure
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('currentPage');
      expect(res.body).toHaveProperty('totalElements');
      expect(res.body).toHaveProperty('lastPage');
      expect(res.body).toHaveProperty('firstPage');

      // Verify data is an array
      expect(Array.isArray(res.body.data)).toBe(true);

      // If there are results, verify the structure
      if (res.body.data.length > 0) {
        const business = res.body.data[0];

        expect(business).toHaveProperty('auxId');
        expect(business).toHaveProperty('id');
        expect(business).toHaveProperty('title');
        expect(business).toHaveProperty('categoryId');
        expect(business).toHaveProperty('accountId');
        expect(business).toHaveProperty('isVerified');
        expect(business).toHaveProperty('classification');

        // Verify data types
        expect(typeof business.auxId).toBe('number');
        expect(typeof business.id).toBe('string');
        expect(typeof business.title).toBe('string');
        expect(typeof business.isVerified).toBe('boolean');
      }
    });

    it('should filter by category ID', async () => {
      const categoryId = 1;

      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ categoryId })
        .expect(200);

      // All returned businesses should have the specified category
      if (res.body.data.length > 0) {
        res.body.data.forEach(business => {
          expect(business.categoryId).toBe(categoryId);
        });
      }
    });

    it('should filter by verification status - verified only', async () => {
      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ isVerified: true })
        .expect(200);

      // All returned businesses should be verified
      if (res.body.data.length > 0) {
        res.body.data.forEach(business => {
          expect(business.isVerified).toBe(true);
        });
      }
    });

    it('should filter by verification status - unverified only', async () => {
      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ isVerified: false })
        .expect(200);

      // All returned businesses should not be verified
      if (res.body.data.length > 0) {
        res.body.data.forEach(business => {
          expect(business.isVerified).toBe(false);
        });
      }
    });

    it('should filter by classification', async () => {
      const classification = 'A1';

      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ classification })
        .expect(200);

      // All returned businesses should have the specified classification
      if (res.body.data.length > 0) {
        res.body.data.forEach(business => {
          expect(business.classification).toBe(classification);
        });
      }
    });

    it('should filter by promoted status', async () => {
      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ isPromoted: true })
        .expect(200);

      // All returned businesses should have promotedAt set
      if (res.body.data.length > 0) {
        res.body.data.forEach(business => {
          expect(business.promotedAt).not.toBeNull();
        });
      }
    });

    it('should filter by location ID', async () => {
      // Using a location from the seed data (Curitiba - PR typically has aux_id around 2)
      const locationId = 2;

      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ locationId })
        .expect(200);

      // All returned businesses should have the specified location
      if (res.body.data.length > 0) {
        res.body.data.forEach(business => {
          expect(business.locationId).toBe(locationId);
        });
      }
    });

    it('should combine multiple filters', async () => {
      const filters = {
        isVerified: true,
        classification: 'A1',
      };

      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send(filters)
        .expect(200);

      // All returned businesses should match all filters
      if (res.body.data.length > 0) {
        res.body.data.forEach(business => {
          expect(business.isVerified).toBe(true);
          expect(business.classification).toBe('A1');
        });
      }
    });

    it('should respect pagination parameters', async () => {
      const page = 1;
      const limit = 5;

      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({})
        .query({ page, limit })
        .expect(200);

      expect(res.body.currentPage).toBe(page);
      expect(res.body.data.length).toBeLessThanOrEqual(limit);
    });

    it('should order by createdAt DESC by default', async () => {
      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({})
        .query({ limit: 10 })
        .expect(200);

      if (res.body.data.length > 1) {
        const firstDate = new Date(res.body.data[0].createdAt);
        const secondDate = new Date(res.body.data[1].createdAt);
        
        // First item should be newer or equal
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    });

    it('should order by views DESC when specified', async () => {
      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({})
        .query({ orderBy: 'views', orderDirection: 'DESC', limit: 10 })
        .expect(200);

      if (res.body.data.length > 1) {
        // Verify descending order by views
        for (let i = 0; i < res.body.data.length - 1; i++) {
          expect(res.body.data[i].views).toBeGreaterThanOrEqual(res.body.data[i + 1].views);
        }
      }
    });

    it('should order by views ASC when specified', async () => {
      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({})
        .query({ orderBy: 'views', orderDirection: 'ASC', limit: 10 })
        .expect(200);

      if (res.body.data.length > 1) {
        // Verify ascending order by views
        for (let i = 0; i < res.body.data.length - 1; i++) {
          expect(res.body.data[i].views).toBeLessThanOrEqual(res.body.data[i + 1].views);
        }
      }
    });

    it('should handle second page correctly', async () => {
      const limit = 5;

      const res1 = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({})
        .query({ page: 1, limit })
        .expect(200);

      if (res1.body.totalElements > limit) {
        const res2 = await request(app.getHttpServer())
          .post('/businesses/filter')
          .send({})
          .query({ page: 2, limit })
          .expect(200);

        expect(res2.body.currentPage).toBe(2);

        // Ensure different results on different pages
        if (res1.body.data.length > 0 && res2.body.data.length > 0) {
          expect(res1.body.data[0].id).not.toBe(res2.body.data[0].id);
        }
      }
    });

    it('should return empty array when no businesses match filter', async () => {
      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ 
          categoryId: 9999, // Non-existent category
        })
        .expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.totalElements).toBe(0);
    });
  });
});
