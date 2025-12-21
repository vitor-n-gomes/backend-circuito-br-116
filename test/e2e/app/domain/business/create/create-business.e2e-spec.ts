import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('BusinessController - Create Business (e2e)', () => {
  let app: INestApplication;
  let createdBusinessIds: number[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Clean up created businesses
    for (const id of createdBusinessIds) {
      try {
        await request(app.getHttpServer())
          .delete(`/businesses/${id}`);
      } catch (error) {
        console.warn(`Failed to delete business ${id}:`, error);
      }
    }

    await app.close();
  });

  describe('POST /businesses', () => {
    it('should create a new business with required fields only', async () => {
      const accountId = 1;
      const newBusiness = {
        title: 'E2E Test Business',
        categoryId: 1,
        locationId: 1,
        locationPretty: 'Km 100, Test City - SP',
        locationLat: -23.5505,
        locationLong: -46.6333,
        classification: 'B1',
      };

      const res = await request(app.getHttpServer())
        .post('/businesses')
        .query({ accountId })
        .send(newBusiness)
        .expect(201);

      // Store for cleanup
      createdBusinessIds.push(res.body.auxId);

      // Verify response structure
      expect(res.body).toHaveProperty('auxId');
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', newBusiness.title);
      expect(res.body).toHaveProperty('categoryId', newBusiness.categoryId);
      expect(res.body).toHaveProperty('accountId', accountId);
      expect(res.body).toHaveProperty('locationId', newBusiness.locationId);
      expect(res.body).toHaveProperty('locationPretty', newBusiness.locationPretty);
      expect(res.body).toHaveProperty('locationLat', newBusiness.locationLat);
      expect(res.body).toHaveProperty('locationLong', newBusiness.locationLong);
      expect(res.body).toHaveProperty('classification', newBusiness.classification);
      expect(res.body).toHaveProperty('isVerified', false); // Default value
      expect(res.body).toHaveProperty('views', 0); // Default value
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should create a business with all optional fields', async () => {
      const accountId = 1;
      const newBusiness = {
        title: 'Complete E2E Test Business',
        description: 'This is a complete test business with all fields',
        categoryId: 2,
        locationId: 2,
        locationPretty: 'Km 200, Test City - PR',
        locationLat: -25.4284,
        locationLong: -49.2733,
        phoneNumber: '(41) 9999-8888',
        whatsapp: '5541999998888',
        email: 'test@business.com',
        instagram: '@testbusiness',
        facebook: 'testbusiness',
        classification: 'A1',
      };

      const res = await request(app.getHttpServer())
        .post('/businesses')
        .query({ accountId })
        .send(newBusiness)
        .expect(201);

      // Store for cleanup
      createdBusinessIds.push(res.body.auxId);

      // Verify all fields
      expect(res.body.title).toBe(newBusiness.title);
      expect(res.body.description).toBe(newBusiness.description);
      expect(res.body.categoryId).toBe(newBusiness.categoryId);
      expect(res.body.phoneNumber).toBe(newBusiness.phoneNumber);
      expect(res.body.whatsapp).toBe(newBusiness.whatsapp);
      expect(res.body.email).toBe(newBusiness.email);
      expect(res.body.instagram).toBe(newBusiness.instagram);
      expect(res.body.facebook).toBe(newBusiness.facebook);
      expect(res.body.classification).toBe(newBusiness.classification);
    });

    it('should fail to create a business without required title', async () => {
      const accountId = 1;
      const invalidBusiness = {
        categoryId: 1,
        locationId: 1,
        locationPretty: 'Km 100, Test City - SP',
        locationLat: -23.5505,
        locationLong: -46.6333,
        classification: 'B1',
        // title is missing
      };

      const res = await request(app.getHttpServer())
        .post('/businesses')
        .query({ accountId })
        .send(invalidBusiness)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should fail to create a business without required categoryId', async () => {
      const accountId = 1;
      const invalidBusiness = {
        title: 'Test Business',
        locationId: 1,
        locationPretty: 'Km 100, Test City - SP',
        locationLat: -23.5505,
        locationLong: -46.6333,
        classification: 'B1',
        // categoryId is missing
      };

      const res = await request(app.getHttpServer())
        .post('/businesses')
        .query({ accountId })
        .send(invalidBusiness)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should fail to create a business without accountId query param', async () => {
      const newBusiness = {
        title: 'Test Business',
        categoryId: 1,
        locationId: 1,
        locationPretty: 'Km 100, Test City - SP',
        locationLat: -23.5505,
        locationLong: -46.6333,
        classification: 'B1',
      };

      const res = await request(app.getHttpServer())
        .post('/businesses')
        // accountId query param is missing
        .send(newBusiness)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should fail with invalid latitude', async () => {
      const accountId = 1;
      const invalidBusiness = {
        title: 'Test Business',
        categoryId: 1,
        locationId: 1,
        locationPretty: 'Km 100, Test City - SP',
        locationLat: 200, // Invalid latitude
        locationLong: -46.6333,
        classification: 'B1',
      };

      const res = await request(app.getHttpServer())
        .post('/businesses')
        .query({ accountId })
        .send(invalidBusiness)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should fail with invalid longitude', async () => {
      const accountId = 1;
      const invalidBusiness = {
        title: 'Test Business',
        categoryId: 1,
        locationId: 1,
        locationPretty: 'Km 100, Test City - SP',
        locationLat: -23.5505,
        locationLong: 200, // Invalid longitude
        classification: 'B1',
      };

      const res = await request(app.getHttpServer())
        .post('/businesses')
        .query({ accountId })
        .send(invalidBusiness)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should create a business and find it by search', async () => {
      const accountId = 1;
      const uniqueTitle = `Unique E2E Business ${Date.now()}`;
      const newBusiness = {
        title: uniqueTitle,
        categoryId: 1,
        locationId: 1,
        locationPretty: 'Km 100, Test City - SP',
        locationLat: -23.5505,
        locationLong: -46.6333,
        classification: 'B1',
      };

      const createRes = await request(app.getHttpServer())
        .post('/businesses')
        .query({ accountId })
        .send(newBusiness)
        .expect(201);

      // Store for cleanup
      createdBusinessIds.push(createRes.body.auxId);

      // Search for the created business
      const searchRes = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: uniqueTitle })
        .expect(200);

      // Should find the created business
      const found = searchRes.body.data.some(b => b.id === createRes.body.id);
      expect(found).toBe(true);
    });

    it('should create a business and retrieve it by ID', async () => {
      const accountId = 1;
      const newBusiness = {
        title: 'Retrievable E2E Business',
        categoryId: 1,
        locationId: 1,
        locationPretty: 'Km 100, Test City - SP',
        locationLat: -23.5505,
        locationLong: -46.6333,
        classification: 'B1',
      };

      const createRes = await request(app.getHttpServer())
        .post('/businesses')
        .query({ accountId })
        .send(newBusiness)
        .expect(201);

      // Store for cleanup
      const businessId = createRes.body.auxId;
      createdBusinessIds.push(businessId);

      // Retrieve the created business
      const getRes = await request(app.getHttpServer())
        .get(`/businesses/${businessId}`)
        .expect(200);

      expect(getRes.body.auxId).toBe(businessId);
      expect(getRes.body.title).toBe(newBusiness.title);
    });

    it('should create businesses for different accounts', async () => {
      const accountId1 = 1;
      const accountId2 = 2;

      const business1 = {
        title: 'Account 1 Business',
        categoryId: 1,
        locationId: 1,
        locationPretty: 'Km 100, Test City - SP',
        locationLat: -23.5505,
        locationLong: -46.6333,
        classification: 'B1',
      };

      const business2 = {
        title: 'Account 2 Business',
        categoryId: 1,
        locationId: 1,
        locationPretty: 'Km 200, Test City - SP',
        locationLat: -23.5505,
        locationLong: -46.6333,
        classification: 'B1',
      };

      const res1 = await request(app.getHttpServer())
        .post('/businesses')
        .query({ accountId: accountId1 })
        .send(business1)
        .expect(201);

      const res2 = await request(app.getHttpServer())
        .post('/businesses')
        .query({ accountId: accountId2 })
        .send(business2)
        .expect(201);

      // Store for cleanup
      createdBusinessIds.push(res1.body.auxId, res2.body.auxId);

      expect(res1.body.accountId).toBe(accountId1);
      expect(res2.body.accountId).toBe(accountId2);
      expect(res1.body.accountId).not.toBe(res2.body.accountId);
    });
  });
});
