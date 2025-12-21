import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { BusinessFactory } from '../factories/business.factory';
import { listOfBusinessToBeFiltered } from './mocks/filter-business.mock';
import { runFactories } from '../../factories/builder.factory';

describe('BusinessController - Filter Businesses (e2e)', () => {
  let app: INestApplication;
  let listOfBusiness: any[] = [];

  beforeAll(async () => {

    const mockData = new BusinessFactory(listOfBusinessToBeFiltered);

    const results = await runFactories(mockData);
    listOfBusiness = results.flat();

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
      // Use category 1 from our test data (we created 3 businesses with category 1)
      const categoryId = 1;

      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ categories: [categoryId] })
        .expect(200);

      // Should return at least our 3 test businesses with category 1
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      res.body.data.forEach(business => {
        expect(business.categoryId).toBe(categoryId);
      });
    });

    it('should filter by verification status - verified only', async () => {
      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ isVerified: true })
        .expect(200);

      // Should return at least our verified test businesses (3 + 3 + 2 = 8)
      expect(res.body.data.length).toBeGreaterThanOrEqual(8);
      res.body.data.forEach(business => {
        expect(business.isVerified).toBe(true);
      });
    });

    it('should filter by verification status - unverified only', async () => {
      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ isVerified: false })
        .expect(200);

      // Should return at least our unverified test businesses (2 + 2 = 4)
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
      res.body.data.forEach(business => {
        expect(business.isVerified).toBe(false);
      });
    });

    it('should filter by classification', async () => {
      // Use classification A1 from our test data (we created 3 businesses with A1)
      const classification = 'A1';

      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ classifications: [classification] })
        .expect(200);

      // Should return at least our 3 test businesses with A1 classification
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      res.body.data.forEach(business => {
        expect(business.classification).toBe(classification);
      });
    });

    it('should filter by promoted status', async () => {
      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ promotedOnly: true })
        .expect(200);

      // Should return at least our promoted test businesses (3 + 2 = 5)
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
      res.body.data.forEach(business => {
        expect(business.promotedAt).not.toBeNull();
      });
    });

    it('should filter by location ID', async () => {
      // Use location 2 from our test data (we created 3 businesses with location 2)
      const locationId = 2;

      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ locationIds: [locationId] })
        .expect(200);

      // Should return at least our 3 test businesses with location 2
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      res.body.data.forEach(business => {
        expect(business.locationId).toBe(locationId);
      });
    });

    it('should combine multiple filters', async () => {
      // Test combining category, verification, and classification
      const filters = {
        categories: [1],
        isVerified: true,
        classifications: ['A1'],
      };

      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send(filters)
        .expect(200);

      // Should return at least our 3 test businesses matching all criteria
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      res.body.data.forEach(business => {
        expect(business.categoryId).toBe(1);
        expect(business.isVerified).toBe(true);
        expect(business.classification).toBe('A1');
      });
    });

    it('should respect pagination parameters', async () => {
      const page = 1;
      const limit = 5;

      const res = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({})
        .query({ page, limit })
        .expect(200);

      expect(res.body.currentPage).toBe(String(page));
      expect(res.body.data.length).toBeLessThanOrEqual(limit);
      expect(res.body.data.length).toBeGreaterThan(0);
      
      // Verify total elements includes at least our test data
      expect(res.body.totalElements).toBeGreaterThanOrEqual(20);
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

        expect(res2.body.currentPage).toBe(String(2));

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
          categories: [99999], // Non-existent category with very high number
          isVerified: true,
          classifications: ['Z9'], // Non-existent classification
        })
        .expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.totalElements).toBe(0);
    });
  });
});
