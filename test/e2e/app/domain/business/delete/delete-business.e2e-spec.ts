import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { BusinessFactory } from '../factories/business.factory';
import { runFactories } from '../../factories/builder.factory';
import { listOfBusinessToBeDeleted } from './mocks/delete-business.mock';

describe('BusinessController - Delete Business (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let listOfBusiness: any[] = [];

  beforeAll(async () => {

    const mockData = new BusinessFactory(listOfBusinessToBeDeleted);

    const results = await runFactories(mockData);
    listOfBusiness = results.flat();

    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {

    if (app) {
      await app.close();
    }

    if (moduleFixture) {
      await moduleFixture.close();
    }
  });

  describe('DELETE /businesses/:id', () => {
    it('should delete a business successfully', async () => {
      const business = listOfBusiness[0]
      const businessId = business.auxId;

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

    it('should return response structure on successful delete', async () => {
      const business = listOfBusiness[1];
      const businessId = business.auxId;

      const res = await request(app.getHttpServer())
        .delete(`/businesses/${businessId}`)
        .expect(200);

      // Verify response structure
      expect(res.body).toHaveProperty('success');
      expect(typeof res.body.success).toBe('boolean');
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when deleting non-existent business', async () => {
      const nonExistentId = 999999999;

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

    it('should handle negative ID gracefully', async () => {
      const res = await request(app.getHttpServer())
        .delete('/businesses/-1')
        .expect(404);

      expect(res.body).toHaveProperty('message');
    });

    it('should handle zero ID gracefully', async () => {
      const res = await request(app.getHttpServer())
        .delete('/businesses/0')
        .expect(404);

      expect(res.body).toHaveProperty('message');
    });

    it('should delete business and remove it from search results', async () => {
      const business = listOfBusiness[2];
      const businessId = business.auxId;

      // Verify it exists first
      await request(app.getHttpServer())
        .get(`/businesses/${businessId}`)
        .expect(200);

      // Delete the business
      await request(app.getHttpServer())
        .delete(`/businesses/${businessId}`)
        .expect(200);

      // Verify it no longer exists
      await request(app.getHttpServer())
        .get(`/businesses/${businessId}`)
        .expect(404);
    });

    it('should delete business and remove it from account listings', async () => {
      const business = listOfBusiness[3];
      const businessId = business.auxId;
      const accountId = business.accountId;

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
      const business = listOfBusiness[4];
      const businessId = business.auxId;

      // Verify it appears in filter results using the business's actual data
      const filterBefore = await request(app.getHttpServer())
        .post('/businesses/filter')
        .send({ categories: [business.categoryId], classifications: [business.classification] })
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
        .send({ categories: [business.categoryId], classifications: [business.classification] })
        .expect(200);

      const foundAfter = filterAfter.body.data.some(b => b.auxId === businessId);
      expect(foundAfter).toBe(false);
    });

    it('should not be able to delete the same business twice', async () => {
      const business = listOfBusiness[5];
      const businessId = business.auxId;

      // First delete should succeed
      await request(app.getHttpServer())
        .delete(`/businesses/${businessId}`)
        .expect(200);

      // Second delete should fail
      await request(app.getHttpServer())
        .delete(`/businesses/${businessId}`)
        .expect(404);
    });
  });
});
