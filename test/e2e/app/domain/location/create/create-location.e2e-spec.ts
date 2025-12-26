import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { flushTestData } from '../../factories/builder.factory';
import { Location } from '@/app/infra/repositories/type-orm/models/location.entity';

describe('LocationController - Create Location (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let createdLocationIds: string[] = [];

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Clean up created locations
    if (createdLocationIds.length > 0) {
      await flushTestData(Location, createdLocationIds, 'id');
    }

    if (app) await app.close();
    if (moduleFixture) await moduleFixture.close();
  });

  describe('POST /locations', () => {
    it('should create a new location with valid data', async () => {
      const timestamp = Date.now();
      const newLocation = {
        name: `E2E Test Location ${timestamp}, BR`,
      };

      const res = await request(app.getHttpServer())
        .post('/locations')
        .send(newLocation)
        .expect(201);

      // Store for cleanup
      createdLocationIds.push(res.body.id);

      // Verify response structure
      expect(res.body).toHaveProperty('aux_id');
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', newLocation.name);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should validate response data types', async () => {
      const timestamp = Date.now();
      const newLocation = {
        name: `E2E Location Types ${timestamp}, SP`,
      };

      const res = await request(app.getHttpServer())
        .post('/locations')
        .send(newLocation)
        .expect(201);

      createdLocationIds.push(res.body.id);

      // Validate data types
      expect(typeof res.body.aux_id).toBe('number');
      expect(typeof res.body.id).toBe('string');
      expect(typeof res.body.name).toBe('string');
      expect(res.body.createdAt).toBeTruthy();
      expect(res.body.updatedAt).toBeTruthy();
    });

    it('should return existing location if name already exists', async () => {
      const timestamp = Date.now();
      const locationName = `E2E Duplicate ${timestamp}, RJ`;

      // Create first location
      const res1 = await request(app.getHttpServer())
        .post('/locations')
        .send({ name: locationName })
        .expect(201);

      createdLocationIds.push(res1.body.id);

      // Try to create duplicate
      const res2 = await request(app.getHttpServer())
        .post('/locations')
        .send({ name: locationName })
        .expect(201);

      // Should return same location
      expect(res2.body.id).toBe(res1.body.id);
      expect(res2.body.aux_id).toBe(res1.body.aux_id);
      expect(res2.body.name).toBe(locationName);
    });

    it('should set createdAt timestamp on creation', async () => {
      const beforeTime = new Date();
      const timestamp = Date.now();

      const res = await request(app.getHttpServer())
        .post('/locations')
        .send({ name: `E2E Timestamp ${timestamp}, MG` })
        .expect(201);

      createdLocationIds.push(res.body.id);

      const afterTime = new Date();
      const createdAt = new Date(res.body.createdAt);

      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should have valid UUID format for id field', async () => {
      const timestamp = Date.now();

      const res = await request(app.getHttpServer())
        .post('/locations')
        .send({ name: `E2E UUID ${timestamp}, RS` })
        .expect(201);

      createdLocationIds.push(res.body.id);

      // UUID v4 format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(res.body.id).toMatch(uuidRegex);
    });

    it('should return 400 for missing name field', async () => {
      const res = await request(app.getHttpServer())
        .post('/locations')
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('message');
      expect(Array.isArray(res.body.message)).toBe(true);
    });

    it('should return 400 for empty name', async () => {
      const res = await request(app.getHttpServer())
        .post('/locations')
        .send({ name: '' })
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for invalid name type', async () => {
      const res = await request(app.getHttpServer())
        .post('/locations')
        .send({ name: 12345 })
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });
  });
});
