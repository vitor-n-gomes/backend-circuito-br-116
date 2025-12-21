import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { createAssetPayload } from '../factories/asset.factory';

describe('AssetsController - Delete Asset (e2e)', () => {
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

  describe('DELETE /assets/:id', () => {
    it('should return correct response structure', async () => {
      // Create asset to delete
      const payload = createAssetPayload();
      const createRes = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      const assetId = createRes.body.id;

      // Delete it
      const res = await request(app.getHttpServer())
        .delete(`/assets/${assetId}`)
        .expect(200);

      expect(res.body).toHaveProperty('success');
      expect(res.body.success).toBe(true);
    });

    it('should delete existing asset', async () => {
      // Create asset to delete
      const payload = createAssetPayload();
      const createRes = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      const assetId = createRes.body.id;

      // Delete it
      await request(app.getHttpServer())
        .delete(`/assets/${assetId}`)
        .expect(200);

      // Verify deletion - asset should not exist
      await request(app.getHttpServer())
        .get(`/assets/${assetId}`)
        .expect(404);
    });

    it('should actually remove asset from database', async () => {
      const payload = createAssetPayload();
      const createRes = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      const assetId = createRes.body.id;

      // Verify it exists
      await request(app.getHttpServer())
        .get(`/assets/${assetId}`)
        .expect(200);

      // Delete it
      await request(app.getHttpServer())
        .delete(`/assets/${assetId}`)
        .expect(200);

      // Verify it's gone
      const getRes = await request(app.getHttpServer())
        .get(`/assets/${assetId}`)
        .expect(404);

      expect(getRes.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent asset ID', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const res = await request(app.getHttpServer())
        .delete(`/assets/${nonExistentId}`)
        .expect(404);

      expect(res.body).toHaveProperty('message');
    });

    it('should validate ID parameter is a valid UUID', async () => {
      const invalidId = 'not-a-uuid';

      const res = await request(app.getHttpServer())
        .delete(`/assets/${invalidId}`)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should fail with numeric ID instead of UUID', async () => {
      const res = await request(app.getHttpServer())
        .delete('/assets/123')
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should not allow deleting already deleted asset', async () => {
      const payload = createAssetPayload();
      const createRes = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      const assetId = createRes.body.id;

      // First deletion should succeed
      await request(app.getHttpServer())
        .delete(`/assets/${assetId}`)
        .expect(200);

      // Second deletion should fail
      await request(app.getHttpServer())
        .delete(`/assets/${assetId}`)
        .expect(404);
    });

    it('should delete asset with minimal fields', async () => {
      const payload = {
        path: `uploads/minimal-delete-${Date.now()}.jpg`,
        size: 512,
      };

      const createRes = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      const assetId = createRes.body.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/assets/${assetId}`)
        .expect(200);

      expect(deleteRes.body.success).toBe(true);
    });

    it('should delete asset with all fields', async () => {
      const payload = createAssetPayload({
        path: 'uploads/full-delete-test.jpg',
        size: 2048000,
        initialName: 'original-filename.jpg',
      });

      const createRes = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      const assetId = createRes.body.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/assets/${assetId}`)
        .expect(200);

      expect(deleteRes.body.success).toBe(true);
    });

    it('should handle deletion of multiple assets sequentially', async () => {
      const assetIds: string[] = [];

      // Create multiple assets
      for (let i = 0; i < 3; i++) {
        const payload = createAssetPayload();
        const createRes = await request(app.getHttpServer())
          .post('/assets')
          .send(payload)
          .expect(201);

        assetIds.push(createRes.body.id);
      }

      // Delete all assets
      for (const assetId of assetIds) {
        const deleteRes = await request(app.getHttpServer())
          .delete(`/assets/${assetId}`)
          .expect(200);

        expect(deleteRes.body.success).toBe(true);
      }

      // Verify all are deleted
      for (const assetId of assetIds) {
        await request(app.getHttpServer())
          .get(`/assets/${assetId}`)
          .expect(404);
      }
    });

    it('should delete recently created asset', async () => {
      const payload = createAssetPayload();

      const createRes = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      const assetId = createRes.body.id;

      // Immediately delete after creation
      await request(app.getHttpServer())
        .delete(`/assets/${assetId}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/assets/${assetId}`)
        .expect(404);
    });
  });
});
