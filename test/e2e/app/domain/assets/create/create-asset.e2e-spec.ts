import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { 
  createAssetPayload, 
  createMinimalAssetPayload,
  createLargeAssetPayload,
  createAssetWithExtension 
} from '../factories/asset.factory';

describe('AssetsController - Create Asset (e2e)', () => {
  let app: INestApplication;
  let createdAssetIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Clean up all created test assets
    for (const assetId of createdAssetIds) {
      try {
        await request(app.getHttpServer())
          .delete(`/assets/${assetId}`);
      } catch (error) {
        console.warn(`Failed to delete test asset ${assetId}:`, error);
      }
    }

    await app.close();
  });

  describe('POST /assets', () => {
    it('should return correct response structure', async () => {
      const payload = createAssetPayload();

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('aux_id');
      expect(res.body).toHaveProperty('path');
      expect(res.body).toHaveProperty('size');
      expect(res.body).toHaveProperty('initialName');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');

      createdAssetIds.push(res.body.id);
    });

    it('should return data with correct types', async () => {
      const payload = createAssetPayload();

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      expect(typeof res.body.id).toBe('string');
      expect(typeof res.body.aux_id).toBe('number');
      expect(typeof res.body.path).toBe('string');
      expect(typeof res.body.size).toBe('number');
      expect(typeof res.body.createdAt).toBe('string');
      expect(typeof res.body.updatedAt).toBe('string');

      createdAssetIds.push(res.body.id);
    });

    it('should create asset with all fields', async () => {
      const payload = createAssetPayload({
        path: 'uploads/custom-image.jpg',
        size: 2048000,
        initialName: 'custom-filename.jpg',
      });

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      expect(res.body.path).toBe(payload.path);
      expect(res.body.size).toBe(payload.size);
      expect(res.body.initialName).toBe(payload.initialName);
      expect(res.body.id).toBeDefined();

      createdAssetIds.push(res.body.id);
    });

    it('should create asset with minimal required fields', async () => {
      const payload = createMinimalAssetPayload();

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      expect(res.body.path).toBe(payload.path);
      expect(res.body.size).toBe(payload.size);
      expect(res.body.id).toBeDefined();

      createdAssetIds.push(res.body.id);
    });

    it('should create asset without initialName (optional field)', async () => {
      const payload = {
        path: `uploads/no-initial-name-${Date.now()}.jpg`,
        size: 512000,
      };

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      expect(res.body.path).toBe(payload.path);
      expect(res.body.size).toBe(payload.size);

      createdAssetIds.push(res.body.id);
    });

    it('should set createdAt timestamp on creation', async () => {
      const beforeTime = new Date();
      const payload = createAssetPayload();

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      const afterTime = new Date();
      const createdAt = new Date(res.body.createdAt);

      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());

      createdAssetIds.push(res.body.id);
    });

    it('should create asset and verify persistence with GET', async () => {
      const payload = createAssetPayload();

      const createRes = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      const createdId = createRes.body.id;

      // Verify persistence with GET
      const getRes = await request(app.getHttpServer())
        .get(`/assets/${createdId}`)
        .expect(200);

      expect(getRes.body.id).toBe(createdId);
      expect(getRes.body.path).toBe(payload.path);
      expect(getRes.body.size).toBe(payload.size);
      expect(getRes.body.initialName).toBe(payload.initialName);

      createdAssetIds.push(createdId);
    });

    it('should generate valid UUID for asset ID', async () => {
      const payload = createAssetPayload();

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(res.body.id).toMatch(uuidRegex);

      createdAssetIds.push(res.body.id);
    });

    it('should create asset with large file size', async () => {
      const payload = createLargeAssetPayload();

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(payload)
        .expect(201);

      expect(res.body.size).toBe(payload.size);
      expect(res.body.size).toBe(10485760);

      createdAssetIds.push(res.body.id);
    });

    it('should create assets with different file extensions', async () => {
      const extensions = ['jpg', 'png', 'pdf', 'mp4'];
      
      for (const ext of extensions) {
        const payload = createAssetWithExtension(ext);

        const res = await request(app.getHttpServer())
          .post('/assets')
          .send(payload)
          .expect(201);

        expect(res.body.path).toContain(`.${ext}`);
        createdAssetIds.push(res.body.id);
      }
    });

    it('should fail with missing required field: path', async () => {
      const invalidPayload = {
        size: 1024000,
        initialName: 'test.jpg',
      };

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(invalidPayload)
        .expect(400);

      expect(res.body).toHaveProperty('message');
      expect(Array.isArray(res.body.message)).toBe(true);
    });

    it('should fail with missing required field: size', async () => {
      const invalidPayload = {
        path: 'uploads/test.jpg',
        initialName: 'test.jpg',
      };

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(invalidPayload)
        .expect(400);

      expect(res.body).toHaveProperty('message');
      expect(Array.isArray(res.body.message)).toBe(true);
    });

    it('should fail with empty path', async () => {
      const invalidPayload = {
        path: '',
        size: 1024000,
      };

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(invalidPayload)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should fail with invalid path type', async () => {
      const invalidPayload = {
        path: 123456,
        size: 1024000,
      };

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(invalidPayload)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should fail with invalid size type', async () => {
      const invalidPayload = {
        path: 'uploads/test.jpg',
        size: 'not-a-number',
      };

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(invalidPayload)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should fail with negative size', async () => {
      const invalidPayload = {
        path: 'uploads/test.jpg',
        size: -1024,
      };

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(invalidPayload)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should fail with zero size', async () => {
      const invalidPayload = {
        path: 'uploads/test.jpg',
        size: 0,
      };

      const res = await request(app.getHttpServer())
        .post('/assets')
        .send(invalidPayload)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should fail with empty body', async () => {
      const res = await request(app.getHttpServer())
        .post('/assets')
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('message');
      expect(Array.isArray(res.body.message)).toBe(true);
    });
  });
});
