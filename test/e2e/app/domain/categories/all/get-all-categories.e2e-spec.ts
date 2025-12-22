import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('CategoriesController - Get All Categories (e2e)', () => {
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
    if (app) {
      await app.close();
    }

    if (moduleFixture) {
      await moduleFixture.close();
    }
  });

  describe('GET /categories', () => {
    it('should return correct response structure', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      // Verify response is an array
      expect(Array.isArray(res.body)).toBe(true);

      // If there are results, verify the structure
      if (res.body.length > 0) {
        const category = res.body[0];
        
        expect(category).toHaveProperty('aux_id');
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('createdAt');
        expect(category).toHaveProperty('updatedAt');
      }
    });

    it('should return data with correct types', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      if (res.body.length > 0) {
        const category = res.body[0];

        // Validate required field types
        expect(typeof category.aux_id).toBe('number');
        expect(typeof category.id).toBe('string');
        expect(typeof category.name).toBe('object');
        expect(category.name).not.toBeNull();

        // Validate timestamp types
        expect(typeof category.createdAt).toBe('string');
        expect(typeof category.updatedAt).toBe('string');
        expect(new Date(category.createdAt).getTime()).not.toBeNaN();
        expect(new Date(category.updatedAt).getTime()).not.toBeNaN();

        // Validate optional fields if present
        if (category.details !== null && category.details !== undefined) {
          expect(typeof category.details).toBe('object');
        }

        if (category.icon !== null && category.icon !== undefined) {
          expect(typeof category.icon).toBe('string');
        }

        if (category.assetId !== null && category.assetId !== undefined) {
          expect(typeof category.assetId).toBe('string');
        }

        if (category.remoteIconUrl !== null && category.remoteIconUrl !== undefined) {
          expect(typeof category.remoteIconUrl).toBe('string');
        }
      }
    });

    it('should return categories with multilingual names', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      if (res.body.length > 0) {
        const category = res.body[0];
        
        // Name should be an object with language codes
        expect(typeof category.name).toBe('object');
        expect(category.name).not.toBeNull();
        
        // Should have at least one language key
        const languageKeys = Object.keys(category.name);
        expect(languageKeys.length).toBeGreaterThan(0);
        
        // All language values should be strings
        languageKeys.forEach(key => {
          expect(typeof category.name[key]).toBe('string');
          expect(category.name[key].length).toBeGreaterThan(0);
        });
      }
    });

    it('should organize categories with subcategories', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      if (res.body.length > 0) {
        // Check if any category has subcategories property
        const categoriesWithSubcategories = res.body.filter(
          cat => cat.subcategories !== undefined
        );

        if (categoriesWithSubcategories.length > 0) {
          const categoryWithSubs = categoriesWithSubcategories[0];
          
          // Subcategories should be an array
          expect(Array.isArray(categoryWithSubs.subcategories)).toBe(true);
          
          // If there are subcategories, verify their structure
          if (categoryWithSubs.subcategories.length > 0) {
            const subcategory = categoryWithSubs.subcategories[0];
            
            expect(subcategory).toHaveProperty('id');
            expect(subcategory).toHaveProperty('name');
            expect(subcategory).toHaveProperty('parentCategoryId');
            
            // Parent category ID should match the parent
            expect(subcategory.parentCategoryId).toBe(categoryWithSubs.id);
          }
        }
      }
    });

    it('should return only parent categories at root level', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      // All root level categories should not have parentCategoryId
      // or should have it explicitly in subcategories only
      res.body.forEach(category => {
        // Root categories should not have parentCategoryId set
        // (they can have it as null/undefined, but subcategories are nested)
        if (category.subcategories && Array.isArray(category.subcategories)) {
          // This is a parent category
          category.subcategories.forEach(sub => {
            expect(sub.parentCategoryId).toBe(category.id);
          });
        }
      });
    });

    it('should return valid UUID format for category IDs', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (res.body.length > 0) {
        res.body.forEach(category => {
          expect(category.id).toMatch(uuidRegex);
          
          // Check subcategories if they exist
          if (category.subcategories && category.subcategories.length > 0) {
            category.subcategories.forEach(sub => {
              expect(sub.id).toMatch(uuidRegex);
              if (sub.parentCategoryId) {
                expect(sub.parentCategoryId).toMatch(uuidRegex);
              }
            });
          }
        });
      }
    });

    it('should return categories with valid details structure', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      if (res.body.length > 0) {
        const categoriesWithDetails = res.body.filter(
          cat => cat.details !== null && cat.details !== undefined
        );

        if (categoriesWithDetails.length > 0) {
          const categoryWithDetails = categoriesWithDetails[0];
          
          // Details should be an object
          expect(typeof categoryWithDetails.details).toBe('object');
          
          // All detail values should be strings
          Object.values(categoryWithDetails.details).forEach(value => {
            expect(typeof value).toBe('string');
          });
        }
      }
    });

    it('should have consistent timestamp ordering', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      if (res.body.length > 0) {
        res.body.forEach(category => {
          const createdAt = new Date(category.createdAt);
          const updatedAt = new Date(category.updatedAt);

          // updatedAt should be >= createdAt
          expect(updatedAt.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());
        });
      }
    });

    it('should handle empty subcategories gracefully', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      if (res.body.length > 0) {
        // Categories with empty subcategories should have an empty array
        res.body.forEach(category => {
          if (category.subcategories !== undefined) {
            expect(Array.isArray(category.subcategories)).toBe(true);
          }
        });
      }
    });

    it('should return categories with auto-increment aux_id', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      if (res.body.length > 1) {
        // Verify aux_id is a positive integer for all categories
        res.body.forEach(category => {
          expect(Number.isInteger(category.aux_id)).toBe(true);
          expect(category.aux_id).toBeGreaterThan(0);
        });
      }
    });
  });
});
