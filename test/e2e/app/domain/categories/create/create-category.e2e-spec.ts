import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { flushTestData } from '../../factories/builder.factory';
import { Category } from '@/app/infra/repositories/type-orm/models/category.entity';

jest.setTimeout(60000);

describe('CategoriesController - Create Category (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let createdCategoryIds: string[] = [];

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Clean up created categories
    if (createdCategoryIds.length > 0) {
      await flushTestData(Category, createdCategoryIds, 'id');
    }

    if (app) await app.close();
    if (moduleFixture) await moduleFixture.close();
  });

  describe('POST /categories', () => {
    it('should create a new category with valid data', async () => {
      const timestamp = Date.now();
      const newCategory = {
        name: {
          en: `E2E Test Category ${timestamp}`,
          pt: `Categoria de Teste E2E ${timestamp}`,
        },
      };

      const res = await request(app.getHttpServer())
        .post('/categories')
        .send(newCategory)
        .expect(201);

      // Store for cleanup
      createdCategoryIds.push(res.body.id);

      // Verify response structure
      expect(res.body).toHaveProperty('aux_id');
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name');
      expect(res.body.name).toEqual(newCategory.name);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should create category with all optional fields', async () => {
      const timestamp = Date.now();
      const newCategory = {
        name: {
          en: `Complete Category ${timestamp}`,
          pt: `Categoria Completa ${timestamp}`,
          es: `Categoría Completa ${timestamp}`,
        },
        details: {
          en: 'Complete category details',
          pt: 'Detalhes completos da categoria',
        },
        icon: 'icon-test',
        remoteIconUrl: `https://example.com/icon-${timestamp}.png`,
      };

      const res = await request(app.getHttpServer())
        .post('/categories')
        .send(newCategory)
        .expect(201);

      createdCategoryIds.push(res.body.id);

      expect(res.body.name).toEqual(newCategory.name);
      expect(res.body.details).toEqual(newCategory.details);
      expect(res.body.icon).toBe(newCategory.icon);
      expect(res.body.remoteIconUrl).toBe(newCategory.remoteIconUrl);
    });

    it('should validate response data types', async () => {
      const timestamp = Date.now();
      const newCategory = {
        name: {
          en: `Type Validation ${timestamp}`,
        },
      };

      const res = await request(app.getHttpServer())
        .post('/categories')
        .send(newCategory)
        .expect(201);

      createdCategoryIds.push(res.body.id);

      // Validate data types
      expect(typeof res.body.aux_id).toBe('number');
      expect(typeof res.body.id).toBe('string');
      expect(typeof res.body.name).toBe('object');
      expect(res.body.createdAt).toBeTruthy();
      expect(res.body.updatedAt).toBeTruthy();
    });

    it('should have valid UUID format for id field', async () => {
      const timestamp = Date.now();

      const res = await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: { en: `UUID Test ${timestamp}` },
        })
        .expect(201);

      createdCategoryIds.push(res.body.id);

      // UUID v4 format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(res.body.id).toMatch(uuidRegex);
    });

    it('should set createdAt timestamp on creation', async () => {
      const beforeTime = new Date();
      const timestamp = Date.now();

      const res = await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: { en: `Timestamp Test ${timestamp}` },
        })
        .expect(201);

      createdCategoryIds.push(res.body.id);

      const afterTime = new Date();
      const createdAt = new Date(res.body.createdAt);

      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should return 400 for missing name field', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('message');
      expect(Array.isArray(res.body.message)).toBe(true);
    });

    it('should return 400 for invalid name type', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'string-instead-of-object' })
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should handle multilingual names correctly', async () => {
      const timestamp = Date.now();
      const multilingualName = {
        en: `English ${timestamp}`,
        pt: `Português ${timestamp}`,
        es: `Español ${timestamp}`,
        fr: `Français ${timestamp}`,
      };

      const res = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: multilingualName })
        .expect(201);

      createdCategoryIds.push(res.body.id);

      expect(res.body.name).toEqual(multilingualName);
    });
  });
});
