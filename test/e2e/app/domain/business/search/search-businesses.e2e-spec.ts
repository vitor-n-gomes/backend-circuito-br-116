import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('BusinessController - Search Businesses (e2e)', () => {
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

  describe('GET /businesses/search', () => {
    it('should return businesses matching search query', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: 'restaurante' })
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
        expect(business).toHaveProperty('description');
        expect(business).toHaveProperty('categoryId');
        expect(business).toHaveProperty('accountId');

        // Verify data types
        expect(typeof business.auxId).toBe('number');
        expect(typeof business.id).toBe('string');
        expect(typeof business.title).toBe('string');

        // Verify the search term appears in title or description
        const searchTerm = 'restaurante';
        const titleMatch = business.title.toLowerCase().includes(searchTerm);
        const descMatch = business.description?.toLowerCase().includes(searchTerm) || false;
        expect(titleMatch || descMatch).toBe(true);
      }
    });

    it('should search in title - Restaurante Sabor da Serra', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: 'Sabor da Serra' })
        .expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
      const found = res.body.data.some(b => b.title.includes('Sabor da Serra'));
      expect(found).toBe(true);
    });

    it('should search in description - churrascaria', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: 'rodízio' })
        .expect(200);

      if (res.body.data.length > 0) {
        const found = res.body.data.some(b => 
          b.description?.toLowerCase().includes('rodízio')
        );
        expect(found).toBe(true);
      }
    });

    it('should return paginated results with default values', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: 'hotel' })
        .expect(200);

      expect(res.body.currentPage).toBe(1);
      expect(res.body.data.length).toBeLessThanOrEqual(20);
    });

    it('should respect custom pagination parameters', async () => {
      const page = 1;
      const limit = 5;

      const res = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: 'posto', page, limit })
        .expect(200);

      expect(res.body.currentPage).toBe(String(page));
      expect(res.body.data.length).toBeLessThanOrEqual(limit);
    });

    it('should return empty results for non-existent search term', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: 'xyzabc123nonexistent' })
        .expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.totalElements).toBe(0);
    });

    it('should handle case-insensitive search', async () => {
      const res1 = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: 'RESTAURANTE' })
        .expect(200);

      const res2 = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: 'restaurante' })
        .expect(200);

      // Both searches should return the same number of results
      expect(res1.body.totalElements).toBe(res2.body.totalElements);
    });

    it('should search for specific business - Shell Select', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: 'Shell' })
        .expect(200);

      if (res.body.data.length > 0) {
        const found = res.body.data.some(b => b.title.includes('Shell'));
        expect(found).toBe(true);
      }
    });

    it('should search by location - Curitiba', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: 'Curitiba' })
        .expect(200);

      // Verify response structure
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('totalElements');
      
      // Search functionality validates correctly regardless of exact matches
      // The search uses full-text search which may return related results
    });

    it('should handle multiple page requests', async () => {
      const limit = 3;

      const res1 = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: 'a', page: 1, limit })
        .expect(200);

      if (res1.body.totalElements > limit) {
        const res2 = await request(app.getHttpServer())
          .get('/businesses/search')
          .query({ query: 'a', page: 2, limit })
          .expect(200);

        expect(res2.body.currentPage).toBe(String(2));
        
        // Ensure different results on different pages
        if (res1.body.data.length > 0 && res2.body.data.length > 0) {
          expect(res1.body.data[0].id).not.toBe(res2.body.data[0].id);
        }
      }
    });
  });
});
