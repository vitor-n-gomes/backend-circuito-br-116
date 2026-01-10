import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { CategoryFactory, createCategoryEntity } from '../factories/category.factory';
import { runFactories, flushTestData } from '../../factories/builder.factory';
import { Category } from '@/app/infra/repositories/type-orm/models/category.entity';

jest.setTimeout(60000);

describe('CategoriesController - Update Category (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testCategoryId: string;
  let testCategoryAuxId: number;

  beforeAll(async () => {
    // Seed test data using factory BEFORE app initialization
    const factory = new CategoryFactory([
      createCategoryEntity({
        name: { en: 'E2E Update Test Category', pt: 'Categoria de Teste para Atualização' },
      }),
    ]);
    const [seededCategory] = await runFactories(factory);
    testCategoryId = seededCategory.id;
    testCategoryAuxId = seededCategory.aux_id;

    // Initialize NestJS app
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Clean up test category
    await flushTestData(Category, [testCategoryAuxId]);

    if (app) await app.close();
    if (moduleFixture) await moduleFixture.close();
  });

  describe('PUT /categories/:id', () => {
    it('should update category name', async () => {
      const timestamp = Date.now();
      const updateData = {
        name: {
          en: `Updated Category ${timestamp}`,
          pt: `Categoria Atualizada ${timestamp}`,
        },
      };

      const res = await request(app.getHttpServer())
        .put(`/categories/${testCategoryId}`)
        .send(updateData)
        .expect(200);

      expect(res.body).toHaveProperty('id', testCategoryId);
      expect(res.body.name).toEqual(updateData.name);
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should update only specified fields', async () => {
      const timestamp = Date.now();
      const updateData = {
        icon: `updated-icon-${timestamp}`,
      };

      const res = await request(app.getHttpServer())
        .put(`/categories/${testCategoryId}`)
        .send(updateData)
        .expect(200);

      expect(res.body.icon).toBe(updateData.icon);
      // Name should remain unchanged
      expect(res.body.name).toBeTruthy();
    });

    it('should update updatedAt timestamp on modification', async () => {
      // Get current category
      const beforeRes = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const currentCategory = beforeRes.body.find(
        (cat: any) => cat.id === testCategoryId
      );
      const beforeUpdatedAt = new Date(currentCategory.updatedAt);

      // Wait to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update category
      const timestamp = Date.now();
      await request(app.getHttpServer())
        .put(`/categories/${testCategoryId}`)
        .send({
          name: {
            en: `Timestamp Update ${timestamp}`,
          },
        })
        .expect(200);

      // Get updated category
      const afterRes = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const updatedCategory = afterRes.body.find(
        (cat: any) => cat.id === testCategoryId
      );
      const afterUpdatedAt = new Date(updatedCategory.updatedAt);

      expect(afterUpdatedAt.getTime()).toBeGreaterThan(beforeUpdatedAt.getTime());
    });

    it('should validate response data types after update', async () => {
      const timestamp = Date.now();
      const updateData = {
        name: {
          en: `Type Validation ${timestamp}`,
        },
      };

      const res = await request(app.getHttpServer())
        .put(`/categories/${testCategoryId}`)
        .send(updateData)
        .expect(200);

      expect(typeof res.body.aux_id).toBe('number');
      expect(typeof res.body.id).toBe('string');
      expect(typeof res.body.name).toBe('object');
      expect(res.body.createdAt).toBeTruthy();
      expect(res.body.updatedAt).toBeTruthy();
    });

    it('should return 404 for non-existent category', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app.getHttpServer())
        .put(`/categories/${nonExistentId}`)
        .send({ name: { en: 'Should Not Work' } })
        .expect(404);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('not found');
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .put('/categories/invalid-uuid')
        .send({ name: { en: 'Test' } })
        .expect(400);
    });

    it('should preserve createdAt timestamp when updating', async () => {
      // Get original category
      const beforeRes = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const originalCategory = beforeRes.body.find(
        (cat: any) => cat.id === testCategoryId
      );
      const originalCreatedAt = new Date(originalCategory.createdAt);

      // Update category
      const timestamp = Date.now();
      await request(app.getHttpServer())
        .put(`/categories/${testCategoryId}`)
        .send({
          name: { en: `Preserve CreatedAt ${timestamp}` },
        })
        .expect(200);

      // Get updated category
      const afterRes = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const updatedCategory = afterRes.body.find(
        (cat: any) => cat.id === testCategoryId
      );
      const afterCreatedAt = new Date(updatedCategory.createdAt);

      // createdAt should remain unchanged
      expect(afterCreatedAt.getTime()).toBe(originalCreatedAt.getTime());
    });

    it('should update details field', async () => {
      const updateData = {
        details: {
          en: 'Updated details in English',
          pt: 'Detalhes atualizados em Português',
        },
      };

      const res = await request(app.getHttpServer())
        .put(`/categories/${testCategoryId}`)
        .send(updateData)
        .expect(200);

      expect(res.body.details).toEqual(updateData.details);
    });

    it('should update remoteIconUrl', async () => {
      const timestamp = Date.now();
      const updateData = {
        remoteIconUrl: `https://example.com/updated-${timestamp}.png`,
      };

      const res = await request(app.getHttpServer())
        .put(`/categories/${testCategoryId}`)
        .send(updateData)
        .expect(200);

      expect(res.body.remoteIconUrl).toBe(updateData.remoteIconUrl);
    });
  });
});
