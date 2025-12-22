import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('BusinessController - Get Business by ID (e2e)', () => {
  let app: INestApplication;
  let existingBusinessId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get an existing business ID from the latest endpoint
    const res = await request(app.getHttpServer())
      .get('/businesses/latest')
      .query({ limit: 1 });

    if (res.body.length > 0) {
      existingBusinessId = res.body[0].auxId;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /businesses/:id', () => {
    it('should return a business by ID', async () => {
      if (!existingBusinessId) {
        console.warn('No businesses found in database, skipping test');
        return;
      }

      const res = await request(app.getHttpServer())
        .get(`/businesses/${existingBusinessId}`)
        .expect(200);

      // Verify response structure
      expect(res.body).toHaveProperty('auxId');
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('description');
      expect(res.body).toHaveProperty('categoryId');
      expect(res.body).toHaveProperty('accountId');
      expect(res.body).toHaveProperty('locationId');
      expect(res.body).toHaveProperty('locationPretty');
      expect(res.body).toHaveProperty('locationLat');
      expect(res.body).toHaveProperty('locationLong');
      expect(res.body).toHaveProperty('classification');
      expect(res.body).toHaveProperty('isVerified');
      expect(res.body).toHaveProperty('views');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');

      // Verify data types
      expect(typeof res.body.auxId).toBe('number');
      expect(typeof res.body.id).toBe('string');
      expect(typeof res.body.title).toBe('string');
      expect(typeof res.body.categoryId).toBe('number');
      expect(typeof res.body.accountId).toBe('number');
      expect(typeof res.body.isVerified).toBe('boolean');
      expect(typeof res.body.views).toBe('number');
      expect(typeof res.body.locationLat).toBe('number');
      expect(typeof res.body.locationLong).toBe('number');

      // Verify the ID matches
      expect(res.body.auxId).toBe(existingBusinessId);
    });

    it('should return complete business details for Restaurante Sabor da Serra', async () => {
      // Search for this specific business first
      const searchRes = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: 'Sabor da Serra' });

      if (searchRes.body.data && searchRes.body.data.length > 0) {
        const businessId = searchRes.body.data[0].auxId;

        const res = await request(app.getHttpServer())
          .get(`/businesses/${businessId}`)
          .expect(200);

        expect(res.body.title).toContain('Sabor da Serra');
        expect(res.body.description).toBeTruthy();
        expect(res.body.locationPretty).toContain('Registro');
        
        // Verify optional contact fields
        if (res.body.phoneNumber) {
          expect(typeof res.body.phoneNumber).toBe('string');
        }
        if (res.body.whatsapp) {
          expect(typeof res.body.whatsapp).toBe('string');
        }
        if (res.body.email) {
          expect(typeof res.body.email).toBe('string');
        }
        if (res.body.instagram) {
          expect(typeof res.body.instagram).toBe('string');
        }
      }
    });

    it('should return 404 for non-existent business ID', async () => {
      const nonExistentId = 999999;

      const res = await request(app.getHttpServer())
        .get(`/businesses/${nonExistentId}`)
        .expect(404);

      expect(res.body).toHaveProperty('message');
    });

    it('should validate ID parameter is a number', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses/invalid')
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should return verified business details', async () => {
      // Search for verified businesses
      const filterRes = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ isVerified: true })
        .query({ limit: 1 });

      if (filterRes.body.data && filterRes.body.data.length > 0) {
        const businessId = filterRes.body.data[0].auxId;

        const res = await request(app.getHttpServer())
          .get(`/businesses/${businessId}`)
          .expect(200);

        expect(res.body.isVerified).toBe(true);
        expect(res.body.auxId).toBe(businessId);
      }
    });

    it('should return promoted business details with promotedAt', async () => {
      // Search for promoted businesses
      const filterRes = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ promotedOnly: true })
        .query({ limit: 1 });

      if (filterRes.body.data && filterRes.body.data.length > 0) {
        const businessId = filterRes.body.data[0].auxId;

        const res = await request(app.getHttpServer())
          .get(`/businesses/${businessId}`)
          .expect(200);

        expect(res.body.promotedAt).not.toBeNull();
        expect(res.body.auxId).toBe(businessId);
      }
    });

    it('should return business with all classification types', async () => {
      if (!existingBusinessId) {
        console.warn('No businesses found in database, skipping test');
        return;
      }

      const res = await request(app.getHttpServer())
        .get(`/businesses/${existingBusinessId}`)
        .expect(200);

      // Classification should be one of the valid types
      const validClassifications = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'C'];
      expect(validClassifications).toContain(res.body.classification);
    });

    it('should return business with location coordinates', async () => {
      if (!existingBusinessId) {
        console.warn('No businesses found in database, skipping test');
        return;
      }

      const res = await request(app.getHttpServer())
        .get(`/businesses/${existingBusinessId}`)
        .expect(200);

      // Verify coordinates are within Brazil's approximate bounds
      expect(res.body.locationLat).toBeGreaterThan(-35);
      expect(res.body.locationLat).toBeLessThan(5);
      expect(res.body.locationLong).toBeGreaterThan(-75);
      expect(res.body.locationLong).toBeLessThan(-30);
    });

    it('should return consistent data on multiple requests', async () => {
      if (!existingBusinessId) {
        console.warn('No businesses found in database, skipping test');
        return;
      }

      const res1 = await request(app.getHttpServer())
        .get(`/businesses/${existingBusinessId}`)
        .expect(200);

      const res2 = await request(app.getHttpServer())
        .get(`/businesses/${existingBusinessId}`)
        .expect(200);

      // Same ID should return exact same data (except potentially views if incremented)
      expect(res1.body.id).toBe(res2.body.id);
      expect(res1.body.title).toBe(res2.body.title);
      expect(res1.body.description).toBe(res2.body.description);
      expect(res1.body.categoryId).toBe(res2.body.categoryId);
    });
  });
});
