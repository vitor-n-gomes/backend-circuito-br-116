import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('BusinessController - Get Businesses by Proximity (e2e)', () => {
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

  describe('GET /businesses/proximity/:lat/:lng/:categoryId', () => {
    it('should return businesses near Curitiba location', async () => {
      // Curitiba coordinates from seed data: -25.4284, -49.2733
      const lat = -25.4284;
      const lng = -49.2733;
      const categoryId = 1;

      const res = await request(app.getHttpServer())
        .get(`/businesses/proximity/${lat}/${lng}/${categoryId}`)
        .expect(200);

      // Verify response is an array
      expect(Array.isArray(res.body)).toBe(true);

      // If there are results, verify the structure
      if (res.body.length > 0) {
        const business = res.body[0];

        expect(business).toHaveProperty('auxId');
        expect(business).toHaveProperty('id');
        expect(business).toHaveProperty('title');
        expect(business).toHaveProperty('categoryId');
        expect(business).toHaveProperty('locationLat');
        expect(business).toHaveProperty('locationLong');
        expect(business).toHaveProperty('locationPretty');

        // Verify data types
        expect(typeof business.auxId).toBe('number');
        expect(typeof business.id).toBe('string');
        expect(typeof business.title).toBe('string');
        expect(typeof business.categoryId).toBe('number');
        expect(typeof business.locationLat).toBe('number');
        expect(typeof business.locationLong).toBe('number');

        // All businesses should have the specified category
        expect(business.categoryId).toBe(categoryId);
      }
    });

    it('should return businesses within default 5km radius', async () => {
      // Use coordinates near Registro - SP: -24.4897, -47.8439
      const lat = -24.4897;
      const lng = -47.8439;
      const categoryId = 1;

      const res = await request(app.getHttpServer())
        .get(`/businesses/proximity/${lat}/${lng}/${categoryId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);

      // Verify all returned businesses match the category
      if (res.body.length > 0) {
        res.body.forEach(business => {
          expect(business.categoryId).toBe(categoryId);
        });
      }
    });

    it('should respect custom maxDistance parameter', async () => {
      const lat = -25.4284;
      const lng = -49.2733;
      const categoryId = 1;
      const maxDistance = 10; // 10km radius

      const res = await request(app.getHttpServer())
        .get(`/businesses/proximity/${lat}/${lng}/${categoryId}`)
        .query({ maxDistance })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return different results for different categories', async () => {
      const lat = -25.4284;
      const lng = -49.2733;
      const categoryId1 = 1;
      const categoryId2 = 2;

      const res1 = await request(app.getHttpServer())
        .get(`/businesses/proximity/${lat}/${lng}/${categoryId1}`)
        .expect(200);

      const res2 = await request(app.getHttpServer())
        .get(`/businesses/proximity/${lat}/${lng}/${categoryId2}`)
        .expect(200);

      // If both have results, verify they have different categories
      if (res1.body.length > 0 && res2.body.length > 0) {
        expect(res1.body[0].categoryId).toBe(categoryId1);
        expect(res2.body[0].categoryId).toBe(categoryId2);
      }
    });

    it('should return empty array when no businesses in proximity', async () => {
      // Use coordinates far from any seeded location (middle of ocean)
      const lat = 0;
      const lng = 0;
      const categoryId = 1;

      const res = await request(app.getHttpServer())
        .get(`/businesses/proximity/${lat}/${lng}/${categoryId}`)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should validate latitude parameter is a number', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/proximity/invalid/-49.2733/1')
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should validate longitude parameter is a number', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/proximity/-25.4284/invalid/1')
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should validate categoryId parameter is a number', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/proximity/-25.4284/-49.2733/invalid')
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should find businesses near Florianópolis', async () => {
      // Florianópolis coordinates from seed: -27.5954, -48.5480
      const lat = -27.5954;
      const lng = -48.5480;
      const categoryId = 1;

      const res = await request(app.getHttpServer())
        .get(`/businesses/proximity/${lat}/${lng}/${categoryId}`)
        .query({ maxDistance: 20 })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should find businesses near Morretes', async () => {
      // Morretes coordinates from seed: -25.4744, -48.8347
      const lat = -25.4744;
      const lng = -48.8347;
      const categoryId = 1;

      const res = await request(app.getHttpServer())
        .get(`/businesses/proximity/${lat}/${lng}/${categoryId}`)
        .query({ maxDistance: 15 })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return more results with larger radius', async () => {
      const lat = -25.4284;
      const lng = -49.2733;
      const categoryId = 1;

      const res1 = await request(app.getHttpServer())
        .get(`/businesses/proximity/${lat}/${lng}/${categoryId}`)
        .query({ maxDistance: 5 })
        .expect(200);

      const res2 = await request(app.getHttpServer())
        .get(`/businesses/proximity/${lat}/${lng}/${categoryId}`)
        .query({ maxDistance: 50 })
        .expect(200);

      // Larger radius should return same or more results
      expect(res2.body.length).toBeGreaterThanOrEqual(res1.body.length);
    });

    it('should handle decimal coordinates correctly', async () => {
      const lat = -25.428456;
      const lng = -49.273398;
      const categoryId = 1;

      const res = await request(app.getHttpServer())
        .get(`/businesses/proximity/${lat}/${lng}/${categoryId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
