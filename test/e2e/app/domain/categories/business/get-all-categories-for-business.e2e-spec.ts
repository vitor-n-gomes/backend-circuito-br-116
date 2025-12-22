import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('CategoriesController - Get All Categories for Business (e2e)', () => {
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

  describe('GET /categories/business', () => {
    it('should return correct response structure', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories/business')
        .expect(200);

      // Verify response is an array
      expect(Array.isArray(res.body)).toBe(true);

      // If there are results, verify the structure
      if (res.body.length > 0) {
        const category = res.body[0];
        
        expect(category).toHaveProperty('aux_id');
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('businessCount');
        expect(category).toHaveProperty('createdAt');
        expect(category).toHaveProperty('updatedAt');
      }
    });

    it('should return data with correct types', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories/business')
        .expect(200);

      if (res.body.length > 0) {
        const category = res.body[0];

        // Validate required field types
        expect(typeof category.aux_id).toBe('number');
        expect(typeof category.id).toBe('string');
        expect(typeof category.name).toBe('object');
        expect(category.name).not.toBeNull();

        // Validate businessCount type
        if (category.businessCount !== null && category.businessCount !== undefined) {
          expect(typeof category.businessCount).toBe('number');
          expect(category.businessCount).toBeGreaterThanOrEqual(0);
        }

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

    it('should include businessCount field for all categories', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories/business')
        .expect(200);

      if (res.body.length > 0) {
        res.body.forEach(category => {
          // businessCount should exist (can be 0 or positive number)
          expect(category).toHaveProperty('businessCount');
          
          if (category.businessCount !== null && category.businessCount !== undefined) {
            expect(typeof category.businessCount).toBe('number');
            expect(category.businessCount).toBeGreaterThanOrEqual(0);
            expect(Number.isInteger(category.businessCount)).toBe(true);
          }
        });
      }
    });

    it('should return categories with multilingual names', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories/business')
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

    it('should return valid UUID format for category IDs', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories/business')
        .expect(200);

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (res.body.length > 0) {
        res.body.forEach(category => {
          expect(category.id).toMatch(uuidRegex);
          
          // Check assetId if present
          if (category.assetId) {
            expect(category.assetId).toMatch(uuidRegex);
          }
        });
      }
    });

    it('should have non-negative business counts', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories/business')
        .expect(200);

      if (res.body.length > 0) {
        res.body.forEach(category => {
          if (category.businessCount !== null && category.businessCount !== undefined) {
            // Business count should never be negative
            expect(category.businessCount).toBeGreaterThanOrEqual(0);
          }
        });
      }
    });

    it('should return categories ordered consistently', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories/business')
        .expect(200);

      // Make a second request to verify consistent ordering
      const res2 = await request(app.getHttpServer())
        .get('/categories/business')
        .expect(200);

      if (res.body.length > 0 && res2.body.length > 0) {
        // First few items should be in the same order
        const limit = Math.min(5, res.body.length, res2.body.length);
        
        for (let i = 0; i < limit; i++) {
          expect(res.body[i].id).toBe(res2.body[i].id);
        }
      }
    });

    it('should have consistent timestamp ordering', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories/business')
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

    it('should return categories with details if available', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories/business')
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

    it('should return categories with auto-increment aux_id', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories/business')
        .expect(200);

      if (res.body.length > 1) {
        // Verify aux_id is a positive integer for all categories
        res.body.forEach(category => {
          expect(Number.isInteger(category.aux_id)).toBe(true);
          expect(category.aux_id).toBeGreaterThan(0);
        });
      }
    });

    it('should handle categories with zero businesses', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories/business')
        .expect(200);

      if (res.body.length > 0) {
        // Find categories with zero businesses
        const categoriesWithZeroBusiness = res.body.filter(
          cat => cat.businessCount === 0
        );

        // These should still be valid categories with all required fields
        if (categoriesWithZeroBusiness.length > 0) {
          const category = categoriesWithZeroBusiness[0];
          
          expect(category).toHaveProperty('id');
          expect(category).toHaveProperty('name');
          expect(category).toHaveProperty('businessCount');
          expect(category.businessCount).toBe(0);
        }
      }
    });

    it('should return all categories regardless of business count', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories/business')
        .expect(200);

      // Verify that we get categories (including those with 0 businesses)
      expect(Array.isArray(res.body)).toBe(true);
      
      if (res.body.length > 0) {
        // All categories should have the businessCount property
        const allHaveBusinessCount = res.body.every(
          cat => cat.hasOwnProperty('businessCount')
        );
        
        expect(allHaveBusinessCount).toBe(true);
      }
    });

    it('should include optional fields when available', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories/business')
        .expect(200);

      if (res.body.length > 0) {
        // Check for categories with optional fields
        const categoriesWithIcon = res.body.filter(cat => cat.icon);
        const categoriesWithAsset = res.body.filter(cat => cat.assetId);
        const categoriesWithRemoteIcon = res.body.filter(cat => cat.remoteIconUrl);

        // Verify types when fields exist
        if (categoriesWithIcon.length > 0) {
          expect(typeof categoriesWithIcon[0].icon).toBe('string');
        }

        if (categoriesWithAsset.length > 0) {
          expect(typeof categoriesWithAsset[0].assetId).toBe('string');
        }

        if (categoriesWithRemoteIcon.length > 0) {
          expect(typeof categoriesWithRemoteIcon[0].remoteIconUrl).toBe('string');
        }
      }
    });
  });
});
