import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('BusinessController - Delete Business (e2e)', () => {
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

  describe('DELETE /businesses/:id', () => {
    it('should delete a business successfully', async () => {
      // Create a test business
      const accountId = 1;
      const newBusiness = {
        title: 'Business to Delete',
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

      const businessId = createRes.body.auxId;

      // Delete the business
      const deleteRes = await request(app.getHttpServer())
        .delete(`/businesses/${businessId}`)
        .expect(200);

      expect(deleteRes.body).toHaveProperty('success');
      expect(deleteRes.body.success).toBe(true);

      // Verify business no longer exists
      await request(app.getHttpServer())
        .get(`/businesses/${businessId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent business', async () => {
      const nonExistentId = 999999;

      const res = await request(app.getHttpServer())
        .delete(`/businesses/${nonExistentId}`)
        .expect(404);

      expect(res.body).toHaveProperty('message');
    });

    it('should validate ID parameter is a number', async () => {
      const res = await request(app.getHttpServer())
        .delete('/businesses/invalid')
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should delete business and remove it from search results', async () => {
      // Create a business with unique name
      const accountId = 1;
      const uniqueTitle = `Deletable Business ${Date.now()}`;
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

      const businessId = createRes.body.auxId;

      // Verify it appears in search
      const searchBefore = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: uniqueTitle })
        .expect(200);

      const foundBefore = searchBefore.body.data.some(b => b.auxId === businessId);
      expect(foundBefore).toBe(true);

      // Delete the business
      await request(app.getHttpServer())
        .delete(`/businesses/${businessId}`)
        .expect(200);

      // Verify it no longer appears in search
      const searchAfter = await request(app.getHttpServer())
        .get('/businesses/search')
        .query({ query: uniqueTitle })
        .expect(200);

      const foundAfter = searchAfter.body.data.some(b => b.auxId === businessId);
      expect(foundAfter).toBe(false);
    });

    it('should delete business and remove it from account listings', async () => {
      // Create a business
      const accountId = 1;
      const newBusiness = {
        title: 'Business for Account Test Delete',
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

      const businessId = createRes.body.auxId;

      // Verify it appears in account listing
      const accountBefore = await request(app.getHttpServer())
        .get(`/businesses/account/${accountId}`)
        .expect(200);

      const foundBefore = accountBefore.body.data.some(b => b.auxId === businessId);
      expect(foundBefore).toBe(true);

      // Delete the business
      await request(app.getHttpServer())
        .delete(`/businesses/${businessId}`)
        .expect(200);

      // Verify it no longer appears in account listing
      const accountAfter = await request(app.getHttpServer())
        .get(`/businesses/account/${accountId}`)
        .expect(200);

      const foundAfter = accountAfter.body.data.some(b => b.auxId === businessId);
      expect(foundAfter).toBe(false);
    });

    it('should delete business and remove it from filter results', async () => {
      // Create a business with specific classification
      const accountId = 1;
      const newBusiness = {
        title: 'Business for Filter Test Delete',
        categoryId: 5,
        locationId: 1,
        locationPretty: 'Km 100, Test City - SP',
        locationLat: -23.5505,
        locationLong: -46.6333,
        classification: 'A1',
      };

      const createRes = await request(app.getHttpServer())
        .post('/businesses')
        .query({ accountId })
        .send(newBusiness)
        .expect(201);

      const businessId = createRes.body.auxId;

      // Verify it appears in filter results
      const filterBefore = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ categoryId: 5, classification: 'A1' })
        .expect(200);

      const foundBefore = filterBefore.body.data.some(b => b.auxId === businessId);
      expect(foundBefore).toBe(true);

      // Delete the business
      await request(app.getHttpServer())
        .delete(`/businesses/${businessId}`)
        .expect(200);

      // Verify it no longer appears in filter results
      const filterAfter = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ categoryId: 5, classification: 'A1' })
        .expect(200);

      const foundAfter = filterAfter.body.data.some(b => b.auxId === businessId);
      expect(foundAfter).toBe(false);
    });

    it('should not be able to delete the same business twice', async () => {
      // Create a business
      const accountId = 1;
      const newBusiness = {
        title: 'Business for Double Delete Test',
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

      const businessId = createRes.body.auxId;

      // First delete should succeed
      await request(app.getHttpServer())
        .delete(`/businesses/${businessId}`)
        .expect(200);

      // Second delete should fail
      await request(app.getHttpServer())
        .delete(`/businesses/${businessId}`)
        .expect(404);
    });

    it('should delete multiple businesses independently', async () => {
      // Create two businesses
      const accountId = 1;
      const business1 = {
        title: 'First Business to Delete',
        categoryId: 1,
        locationId: 1,
        locationPretty: 'Km 100, Test City - SP',
        locationLat: -23.5505,
        locationLong: -46.6333,
        classification: 'B1',
      };

      const business2 = {
        title: 'Second Business to Delete',
        categoryId: 1,
        locationId: 1,
        locationPretty: 'Km 200, Test City - SP',
        locationLat: -23.5505,
        locationLong: -46.6333,
        classification: 'B1',
      };

      const createRes1 = await request(app.getHttpServer())
        .post('/businesses')
        .query({ accountId })
        .send(business1)
        .expect(201);

      const createRes2 = await request(app.getHttpServer())
        .post('/businesses')
        .query({ accountId })
        .send(business2)
        .expect(201);

      const businessId1 = createRes1.body.auxId;
      const businessId2 = createRes2.body.auxId;

      // Delete first business
      await request(app.getHttpServer())
        .delete(`/businesses/${businessId1}`)
        .expect(200);

      // First should not exist
      await request(app.getHttpServer())
        .get(`/businesses/${businessId1}`)
        .expect(404);

      // Second should still exist
      await request(app.getHttpServer())
        .get(`/businesses/${businessId2}`)
        .expect(200);

      // Delete second business
      await request(app.getHttpServer())
        .delete(`/businesses/${businessId2}`)
        .expect(200);

      // Second should now not exist
      await request(app.getHttpServer())
        .get(`/businesses/${businessId2}`)
        .expect(404);
    });
  });
});
