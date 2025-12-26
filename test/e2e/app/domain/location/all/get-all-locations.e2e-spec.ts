import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { LocationFactory, createLocationEntity } from '../factories/location.factory';
import { runFactories, flushTestData } from '../../factories/builder.factory';
import { Location } from '@/app/infra/repositories/type-orm/models/location.entity';

describe('LocationController - Get All Locations (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testLocationIds: number[] = [];

  beforeAll(async () => {
    // Seed test data using factory BEFORE app initialization
    const factory = new LocationFactory([
      createLocationEntity({ name: 'E2E Test Location 1' }),
      createLocationEntity({ name: 'E2E Test Location 2' }),
      createLocationEntity({ name: 'E2E Test Location 3' }),
    ]);
    const seededLocations = await runFactories(factory);
    testLocationIds = seededLocations.map(location => location.aux_id);

    // Initialize NestJS app
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Clean up created test data
    await flushTestData(Location, testLocationIds);

    // Close app and module connections
    if (app) await app.close();
    if (moduleFixture) await moduleFixture.close();
  });

  describe('GET /locations', () => {
    it('should return array of locations with correct structure', async () => {
      const res = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      // Verify structure of first location
      const firstLocation = res.body[0];
      expect(firstLocation).toHaveProperty('aux_id');
      expect(firstLocation).toHaveProperty('id');
      expect(firstLocation).toHaveProperty('name');
      expect(firstLocation).toHaveProperty('createdAt');
      expect(firstLocation).toHaveProperty('updatedAt');
    });

    it('should validate response data types', async () => {
      const res = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      const firstLocation = res.body[0];

      // Validate data types
      expect(typeof firstLocation.aux_id).toBe('number');
      expect(typeof firstLocation.id).toBe('string');
      expect(typeof firstLocation.name).toBe('string');
      expect(firstLocation.createdAt).toBeTruthy();
      expect(firstLocation.updatedAt).toBeTruthy();
    });

    it('should return locations with valid UUID format for id field', async () => {
      const res = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      const firstLocation = res.body[0];

      // UUID v4 format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(firstLocation.id).toMatch(uuidRegex);
    });

    it('should return locations with non-empty names', async () => {
      const res = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      // Verify all locations have non-empty names
      res.body.forEach((location: any) => {
        expect(location.name).toBeTruthy();
        expect(location.name.length).toBeGreaterThan(0);
        expect(typeof location.name).toBe('string');
      });
    });

    it('should return locations with valid timestamps', async () => {
      const res = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      const firstLocation = res.body[0];

      // Verify timestamps are valid dates
      const createdAt = new Date(firstLocation.createdAt);
      const updatedAt = new Date(firstLocation.updatedAt);

      expect(createdAt.getTime()).not.toBeNaN();
      expect(updatedAt.getTime()).not.toBeNaN();
      expect(createdAt.getTime()).toBeLessThanOrEqual(updatedAt.getTime());
    });

    it('should include test locations in the response', async () => {
      const res = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      // Verify test locations are included
      const locationIds = res.body.map((loc: any) => loc.aux_id);
      testLocationIds.forEach(testId => {
        expect(locationIds).toContain(testId);
      });
    });

    it('should return locations with unique aux_id values', async () => {
      const res = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      const auxIds = res.body.map((loc: any) => loc.aux_id);
      const uniqueAuxIds = new Set(auxIds);

      expect(uniqueAuxIds.size).toBe(auxIds.length);
    });

    it('should return locations with unique id (UUID) values', async () => {
      const res = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      const ids = res.body.map((loc: any) => loc.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should return locations ordered consistently', async () => {
      const res1 = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      const res2 = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      // Verify same order in multiple requests
      expect(res1.body.length).toBe(res2.body.length);
      
      for (let i = 0; i < Math.min(5, res1.body.length); i++) {
        expect(res1.body[i].aux_id).toBe(res2.body[i].aux_id);
      }
    });

    it('should handle content-type header correctly', async () => {
      const res = await request(app.getHttpServer())
        .get('/locations')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(res.body).toBeDefined();
    });
  });
});
