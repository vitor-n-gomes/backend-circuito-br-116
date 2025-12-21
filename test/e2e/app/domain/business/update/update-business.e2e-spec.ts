import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { getRandomLocationId } from '../factories/relation.factory';

describe('BusinessController - Update Business (e2e)', () => {
  let app: INestApplication;
  let testBusinessId: number;
  let validLocationId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get a valid location ID from the database
    validLocationId = getRandomLocationId();;

    // Create a test business for updates
    const accountId = 1;
    const newBusiness = {
      title: 'Test Business for Updates',
      description: 'Original description',
      categoryId: 1,
      locationId: validLocationId,
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

    testBusinessId = createRes.body.auxId;
  });

  afterAll(async () => {
    // Clean up test business
    if (testBusinessId) {
      try {
        await request(app.getHttpServer())
          .delete(`/businesses/${testBusinessId}`);
      } catch (error) {
        console.warn(`Failed to delete test business ${testBusinessId}:`, error);
      }
    }

    await app.close();
  });

  describe('PUT /businesses/:id', () => {
    it('should update business title', async () => {
      const updateData = {
        title: 'Updated Business Title',
      };

      const res = await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send(updateData)
        .expect(200);

      expect(res.body.auxId).toBe(testBusinessId);
      expect(res.body.title).toBe(updateData.title);

      // Verify the update persisted
      const getRes = await request(app.getHttpServer())
        .get(`/businesses/${testBusinessId}`)
        .expect(200);

      expect(getRes.body.title).toBe(updateData.title);
    });

    it('should update business description', async () => {
      const updateData = {
        description: 'This is an updated description for the test business',
      };

      const res = await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send(updateData)
        .expect(200);

      expect(res.body.description).toBe(updateData.description);

      // Verify the update persisted
      const getRes = await request(app.getHttpServer())
        .get(`/businesses/${testBusinessId}`)
        .expect(200);

      expect(getRes.body.description).toBe(updateData.description);
    });

    it('should update multiple fields at once', async () => {
      const updateData = {
        title: 'Multi-Field Update Test',
        description: 'Updated description',
        phoneNumber: '(41) 1111-2222',
        whatsapp: '5541111122222',
        email: 'updated@business.com',
      };

      const res = await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send(updateData)
        .expect(200);

      expect(res.body.title).toBe(updateData.title);
      expect(res.body.description).toBe(updateData.description);
      expect(res.body.phoneNumber).toBe(updateData.phoneNumber);
      expect(res.body.whatsapp).toBe(updateData.whatsapp);
      expect(res.body.email).toBe(updateData.email);
    });

    it('should update social media fields', async () => {
      const updateData = {
        instagram: '@updatedhandle',
        facebook: 'updatedfbpage',
      };

      const res = await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send(updateData)
        .expect(200);

      expect(res.body.instagram).toBe(updateData.instagram);
      expect(res.body.facebook).toBe(updateData.facebook);
    });

    it('should update location information', async () => {
      const updateData = {
        locationPretty: 'Km 250, Updated City - PR',
        locationLat: -25.4284,
        locationLong: -49.2733,
      };

      const res = await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send(updateData)
        .expect(200);

      expect(res.body.locationPretty).toBe(updateData.locationPretty);
      expect(res.body.locationLat).toBe(updateData.locationLat);
      expect(res.body.locationLong).toBe(updateData.locationLong);
    });

    it('should update classification', async () => {
      const updateData = {
        classification: 'A1',
      };

      const res = await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send(updateData)
        .expect(200);

      expect(res.body.classification).toBe(updateData.classification);
    });

    it('should update verification status', async () => {
      const updateData = {
        isVerified: true,
      };

      const res = await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send(updateData)
        .expect(200);

      expect(res.body.isVerified).toBe(true);
    });

    it('should update updatedAt timestamp', async () => {
      // Get current business
      const beforeRes = await request(app.getHttpServer())
        .get(`/businesses/${testBusinessId}`)
        .expect(200);

      const beforeUpdatedAt = new Date(beforeRes.body.updatedAt);

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update the business
      const updateData = {
        title: 'Timestamp Test Update',
      };

      await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send(updateData)
        .expect(200);

      // Get updated business
      const afterRes = await request(app.getHttpServer())
        .get(`/businesses/${testBusinessId}`)
        .expect(200);

      const afterUpdatedAt = new Date(afterRes.body.updatedAt);

      // updatedAt should be more recent
      expect(afterUpdatedAt.getTime()).toBeGreaterThan(beforeUpdatedAt.getTime());
    });

    it('should return 404 for non-existent business ID', async () => {
      const nonExistentId = 999999;
      const updateData = {
        title: 'This should fail',
      };

      const res = await request(app.getHttpServer())
        .put(`/businesses/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(res.body).toHaveProperty('message');
    });

    it('should validate ID parameter is a number', async () => {
      const updateData = {
        title: 'Test',
      };

      const res = await request(app.getHttpServer())
        .put('/businesses/invalid')
        .send(updateData)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should fail with invalid latitude', async () => {
      const updateData = {
        locationLat: 200, // Invalid latitude
      };

      const res = await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send(updateData)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should fail with invalid longitude', async () => {
      const updateData = {
        locationLong: 200, // Invalid longitude
      };

      const res = await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send(updateData)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should not update with empty body', async () => {
      // Get current state
      const beforeRes = await request(app.getHttpServer())
        .get(`/businesses/${testBusinessId}`)
        .expect(200);

      // Send empty update
      const res = await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send({})
        .expect(200);

      // Business should remain unchanged (except updatedAt)
      expect(res.body.title).toBe(beforeRes.body.title);
      expect(res.body.description).toBe(beforeRes.body.description);
    });

    it('should preserve unchanged fields when updating', async () => {
      // Get current state
      const beforeRes = await request(app.getHttpServer())
        .get(`/businesses/${testBusinessId}`)
        .expect(200);

      const originalDescription = beforeRes.body.description;
      const originalCategoryId = beforeRes.body.categoryId;

      // Update only title
      const updateData = {
        title: 'Partial Update Test',
      };

      const res = await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send(updateData)
        .expect(200);

      // Title should be updated
      expect(res.body.title).toBe(updateData.title);

      // Other fields should remain unchanged
      expect(res.body.description).toBe(originalDescription);
      expect(res.body.categoryId).toBe(originalCategoryId);
    });

    it('should update and find business with new title in search', async () => {
      const uniqueTitle = `Searchable Update ${Date.now()}`;
      const updateData = {
        title: uniqueTitle,
      };

      await request(app.getHttpServer())
        .put(`/businesses/${testBusinessId}`)
        .send(updateData)
        .expect(200);

      // Search for the updated business
      const searchRes = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: uniqueTitle })
        .expect(200);

      const found = searchRes.body.data.some(b => b.auxId === testBusinessId);
      expect(found).toBe(true);
    });
  });
});
