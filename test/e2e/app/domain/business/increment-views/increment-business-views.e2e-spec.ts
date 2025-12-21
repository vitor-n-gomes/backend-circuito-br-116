import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('BusinessController - Increment Business Views (e2e)', () => {
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

  describe('POST /businesses/:id/increment-views', () => {
    it('should increment views for a business', async () => {
      if (!existingBusinessId) {
        console.warn('No businesses found in database, skipping test');
        return;
      }

      // Get initial view count
      const initialRes = await request(app.getHttpServer())
        .get(`/businesses/${existingBusinessId}`)
        .expect(200);

      const initialViews = initialRes.body.views;

      // Increment views
      const incrementRes = await request(app.getHttpServer())
        .post(`/businesses/${existingBusinessId}/increment-views`)
        .expect(200);

      expect(incrementRes.body).toHaveProperty('success');
      expect(incrementRes.body.success).toBe(true);

      // Get updated view count
      const updatedRes = await request(app.getHttpServer())
        .get(`/businesses/${existingBusinessId}`)
        .expect(200);

      const updatedViews = updatedRes.body.views;

      // Verify views were incremented
      expect(updatedViews).toBe(initialViews + 1);
    });

    it('should increment views multiple times', async () => {
      if (!existingBusinessId) {
        console.warn('No businesses found in database, skipping test');
        return;
      }

      // Get initial view count
      const initialRes = await request(app.getHttpServer())
        .get(`/businesses/${existingBusinessId}`)
        .expect(200);

      const initialViews = initialRes.body.views;

      // Increment views 3 times
      await request(app.getHttpServer())
        .post(`/businesses/${existingBusinessId}/increment-views`)
        .expect(200);

      await request(app.getHttpServer())
        .post(`/businesses/${existingBusinessId}/increment-views`)
        .expect(200);

      await request(app.getHttpServer())
        .post(`/businesses/${existingBusinessId}/increment-views`)
        .expect(200);

      // Get updated view count
      const updatedRes = await request(app.getHttpServer())
        .get(`/businesses/${existingBusinessId}`)
        .expect(200);

      const updatedViews = updatedRes.body.views;

      // Verify views were incremented by 3
      expect(updatedViews).toBe(initialViews + 3);
    });

    it('should return 404 for non-existent business ID', async () => {
      const nonExistentId = 999999;

      const res = await request(app.getHttpServer())
        .post(`/businesses/${nonExistentId}/increment-views`)
        .expect(404);

      expect(res.body).toHaveProperty('message');
    });

    it('should validate ID parameter is a number', async () => {
      const res = await request(app.getHttpServer())
        .post('/businesses/invalid/increment-views')
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should return success true on successful increment', async () => {
      if (!existingBusinessId) {
        console.warn('No businesses found in database, skipping test');
        return;
      }

      const res = await request(app.getHttpServer())
        .post(`/businesses/${existingBusinessId}/increment-views`)
        .expect(200);

      expect(res.body).toEqual({ success: true });
    });

    it('should increment views for different businesses independently', async () => {
      // Get two different businesses
      const res = await request(app.getHttpServer())
        .get('/businesses/latest')
        .query({ limit: 2 });

      if (res.body.length < 2) {
        console.warn('Not enough businesses in database, skipping test');
        return;
      }

      const business1Id = res.body[0].auxId;
      const business2Id = res.body[1].auxId;

      // Get initial view counts
      const initial1 = await request(app.getHttpServer())
        .get(`/businesses/${business1Id}`)
        .expect(200);

      const initial2 = await request(app.getHttpServer())
        .get(`/businesses/${business2Id}`)
        .expect(200);

      const initialViews1 = initial1.body.views;
      const initialViews2 = initial2.body.views;

      // Increment views only for business 1
      await request(app.getHttpServer())
        .post(`/businesses/${business1Id}/increment-views`)
        .expect(200);

      // Get updated view counts
      const updated1 = await request(app.getHttpServer())
        .get(`/businesses/${business1Id}`)
        .expect(200);

      const updated2 = await request(app.getHttpServer())
        .get(`/businesses/${business2Id}`)
        .expect(200);

      // Business 1 views should be incremented
      expect(updated1.body.views).toBe(initialViews1 + 1);

      // Business 2 views should remain unchanged
      expect(updated2.body.views).toBe(initialViews2);
    });

    it('should increment views for a newly searched business', async () => {
      // Search for a specific business
      const searchRes = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: 'Shell' });

      if (searchRes.body.data && searchRes.body.data.length > 0) {
        const businessId = searchRes.body.data[0].auxId;

        // Get initial view count
        const initialRes = await request(app.getHttpServer())
          .get(`/businesses/${businessId}`)
          .expect(200);

        const initialViews = initialRes.body.views;

        // Increment views
        await request(app.getHttpServer())
          .post(`/businesses/${businessId}/increment-views`)
          .expect(200);

        // Verify increment
        const updatedRes = await request(app.getHttpServer())
          .get(`/businesses/${businessId}`)
          .expect(200);

        expect(updatedRes.body.views).toBe(initialViews + 1);
      }
    });

    it('should increment views atomically', async () => {
      if (!existingBusinessId) {
        console.warn('No businesses found in database, skipping test');
        return;
      }

      // Get initial view count
      const initialRes = await request(app.getHttpServer())
        .get(`/businesses/${existingBusinessId}`)
        .expect(200);

      const initialViews = initialRes.body.views;

      // Make concurrent increment requests
      await Promise.all([
        request(app.getHttpServer())
          .post(`/businesses/${existingBusinessId}/increment-views`)
          .expect(200),
        request(app.getHttpServer())
          .post(`/businesses/${existingBusinessId}/increment-views`)
          .expect(200),
        request(app.getHttpServer())
          .post(`/businesses/${existingBusinessId}/increment-views`)
          .expect(200),
      ]);

      // Get final view count
      const finalRes = await request(app.getHttpServer())
        .get(`/businesses/${existingBusinessId}`)
        .expect(200);

      // All increments should be counted
      expect(finalRes.body.views).toBe(initialViews + 3);
    });
  });
});
