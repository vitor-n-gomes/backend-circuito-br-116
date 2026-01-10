import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { CategoryFactory, createCategoryEntity } from '../factories/category.factory';
import { runFactories } from '../../factories/builder.factory';

jest.setTimeout(60000);

describe('CategoriesController - Delete Category (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (moduleFixture) await moduleFixture.close();
  });

  describe('DELETE /categories/:id', () => {
    it('should delete an existing category', async () => {
      // Create category to delete
      const factory = new CategoryFactory([
        createCategoryEntity({
          name: { en: 'E2E Delete Test Category 1' },
        }),
      ]);
      const [createdCategory] = await runFactories(factory);
      const categoryId = createdCategory.id;

      // Delete it
      const res = await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);

      // Verify deletion - category should not be in the list
      const listRes = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const deletedCategory = listRes.body.find(
        (cat: any) => cat.id === categoryId
      );
      expect(deletedCategory).toBeUndefined();
    });

    it('should return correct response structure on successful delete', async () => {
      // Create category to delete
      const factory = new CategoryFactory([
        createCategoryEntity({
          name: { en: 'E2E Delete Test Category 2' },
        }),
      ]);
      const [createdCategory] = await runFactories(factory);

      const res = await request(app.getHttpServer())
        .delete(`/categories/${createdCategory.id}`)
        .expect(200);

      expect(res.body).toEqual({ success: true });
      expect(typeof res.body.success).toBe('boolean');
    });

    it('should return 404 for non-existent category', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app.getHttpServer())
        .delete(`/categories/${nonExistentId}`)
        .expect(404);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('not found');
    });

    it('should return 404 when trying to delete already deleted category', async () => {
      // Create category
      const factory = new CategoryFactory([
        createCategoryEntity({
          name: { en: 'E2E Delete Test Category 3' },
        }),
      ]);
      const [createdCategory] = await runFactories(factory);
      const categoryId = createdCategory.id;

      // Delete it first time
      await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .expect(200);

      // Try to delete again
      const res = await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .expect(404);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('not found');
    });

    it('should return 400 for malformed UUID', async () => {
      const malformedId = 'not-a-valid-uuid';

      await request(app.getHttpServer())
        .delete(`/categories/${malformedId}`)
        .expect(400);
    });

    it('should only delete specified category', async () => {
      // Create multiple categories
      const factory = new CategoryFactory([
        createCategoryEntity({ name: { en: 'E2E Keep Category 1' } }),
        createCategoryEntity({ name: { en: 'E2E Keep Category 2' } }),
        createCategoryEntity({ name: { en: 'E2E Delete Category' } }),
      ]);
      const createdCategories = await runFactories(factory);
      const [keepCat1, keepCat2, deleteCat] = createdCategories;

      // Delete only one
      await request(app.getHttpServer())
        .delete(`/categories/${deleteCat.id}`)
        .expect(200);

      // Verify others still exist
      const listRes = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const category1Exists = listRes.body.some(
        (cat: any) => cat.id === keepCat1.id
      );
      const category2Exists = listRes.body.some(
        (cat: any) => cat.id === keepCat2.id
      );
      const deletedCategoryExists = listRes.body.some(
        (cat: any) => cat.id === deleteCat.id
      );

      expect(category1Exists).toBe(true);
      expect(category2Exists).toBe(true);
      expect(deletedCategoryExists).toBe(false);

      // Cleanup
      await request(app.getHttpServer()).delete(`/categories/${keepCat1.id}`);
      await request(app.getHttpServer()).delete(`/categories/${keepCat2.id}`);
    });

    it('should handle deletion of category with details', async () => {
      const factory = new CategoryFactory([
        createCategoryEntity({
          name: { en: 'Category with Details' },
          details: { en: 'Some details', pt: 'Alguns detalhes' },
          icon: 'test-icon',
          remoteIconUrl: 'https://example.com/icon.png',
        }),
      ]);
      const [createdCategory] = await runFactories(factory);

      const res = await request(app.getHttpServer())
        .delete(`/categories/${createdCategory.id}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify deletion
      const listRes = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const found = listRes.body.find(
        (cat: any) => cat.id === createdCategory.id
      );
      expect(found).toBeUndefined();
    });
  });
});
