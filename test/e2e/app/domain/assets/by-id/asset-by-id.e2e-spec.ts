import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { createAssetPayload, AssetFactory, createAssetEntity } from '../factories/asset.factory';
import { runFactories } from '../../factories/builder.factory';

describe('AssetsController - Get Asset by ID (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testAssetId: string;

  beforeAll(async () => {
    // Create a test asset using factory builder BEFORE initializing the app
    const assetEntity = createAssetEntity({
      path: 'uploads/test-get-asset.jpg',
      size: 1536000,
      initialName: 'test-get-asset.jpg',
    });

    const factory = new AssetFactory([assetEntity]);
    const [createdAsset] = await runFactories(factory);

    testAssetId = createdAsset.id;

    // NOW initialize the NestJS app
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Clean up test asset
    if (testAssetId) {
      try {
        await request(app.getHttpServer())
          .delete(`/assets/${testAssetId}`);
      } catch (error) {
        console.warn(`Failed to delete test asset ${testAssetId}:`, error);
      }
    }

    if (app) {
      await app.close();
    }

    if (moduleFixture) {
      await moduleFixture.close();
    }
  });

  describe('GET /assets/:id', () => {
    it('should return correct response structure', async () => {
      const res = await request(app.getHttpServer())
        .get(`/assets/${testAssetId}`)
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('aux_id');
      expect(res.body).toHaveProperty('path');
      expect(res.body).toHaveProperty('size');
      expect(res.body).toHaveProperty('initialName');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should return data with correct types', async () => {
      const res = await request(app.getHttpServer())
        .get(`/assets/${testAssetId}`)
        .expect(200);

      expect(typeof res.body.id).toBe('string');
      expect(typeof res.body.aux_id).toBe('number');
      expect(typeof res.body.path).toBe('string');
      expect(typeof res.body.size).toBe('number');
      expect(typeof res.body.createdAt).toBe('string');
      expect(typeof res.body.updatedAt).toBe('string');
    });

    it('should return the correct asset by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/assets/${testAssetId}`)
        .expect(200);

      expect(res.body.id).toBe(testAssetId);
      expect(res.body.path).toBe('uploads/test-get-asset.jpg');
      expect(res.body.size).toBe(1536000);
      expect(res.body.initialName).toBe('test-get-asset.jpg');
    });

    it('should return valid UUID in response', async () => {
      const res = await request(app.getHttpServer())
        .get(`/assets/${testAssetId}`)
        .expect(200);

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(res.body.id).toMatch(uuidRegex);
    });

    it('should return timestamps in ISO format', async () => {
      const res = await request(app.getHttpServer())
        .get(`/assets/${testAssetId}`)
        .expect(200);

      const createdAt = new Date(res.body.createdAt);
      const updatedAt = new Date(res.body.updatedAt);

      expect(createdAt.toString()).not.toBe('Invalid Date');
      expect(updatedAt.toString()).not.toBe('Invalid Date');
    });

    it('should return 404 for non-existent asset ID', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const res = await request(app.getHttpServer())
        .get(`/assets/${nonExistentId}`)
        .expect(404);

      expect(res.body).toHaveProperty('message');
    });

    it('should validate ID parameter is a valid UUID', async () => {
      const invalidId = 'not-a-uuid';

      const res = await request(app.getHttpServer())
        .get(`/assets/${invalidId}`)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should fail with numeric ID instead of UUID', async () => {
      const res = await request(app.getHttpServer())
        .get('/assets/123')
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should fail with empty UUID', async () => {
      const res = await request(app.getHttpServer())
        .get('/assets/')
        .expect(404); // Routes to different endpoint or 404

      // This will match POST /assets or return 404
    });

    it('should return consistent data on multiple requests', async () => {
      const res1 = await request(app.getHttpServer())
        .get(`/assets/${testAssetId}`)
        .expect(200);

      const res2 = await request(app.getHttpServer())
        .get(`/assets/${testAssetId}`)
        .expect(200);

      expect(res1.body.id).toBe(res2.body.id);
      expect(res1.body.path).toBe(res2.body.path);
      expect(res1.body.size).toBe(res2.body.size);
      expect(res1.body.aux_id).toBe(res2.body.aux_id);
    });
  });
});
