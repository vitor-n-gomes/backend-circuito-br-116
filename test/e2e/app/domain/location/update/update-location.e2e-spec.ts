import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { LocationFactory, createLocationEntity } from '../factories/location.factory';
import { runFactories, flushTestData } from '../../factories/builder.factory';
import { Location } from '@/app/infra/repositories/type-orm/models/location.entity';

describe('LocationController - Update Location (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testLocationId: string;
  let testLocationAuxId: number;

  beforeAll(async () => {
    // Seed test data using factory BEFORE app initialization
    const factory = new LocationFactory([
      createLocationEntity({ name: 'E2E Update Test Location' }),
    ]);
    const [seededLocation] = await runFactories(factory);
    testLocationId = seededLocation.id;
    testLocationAuxId = seededLocation.aux_id;

    // Initialize NestJS app
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Clean up test location
    await flushTestData(Location, [testLocationAuxId]);

    if (app) await app.close();
    if (moduleFixture) await moduleFixture.close();
  });

  describe('PUT /locations/:id', () => {
    it('should update location name', async () => {
      const timestamp = Date.now();
      const updateData = {
        name: `Updated Location ${timestamp}, SP`,
      };

      const res = await request(app.getHttpServer())
        .put(`/locations/${testLocationId}`)
        .send(updateData)
        .expect(200);

      expect(res.body).toHaveProperty('id', testLocationId);
      expect(res.body).toHaveProperty('name', updateData.name);
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should update updatedAt timestamp on modification', async () => {
      // Get current location
      const beforeRes = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      const currentLocation = beforeRes.body.find(
        (loc: any) => loc.id === testLocationId
      );
      const beforeUpdatedAt = new Date(currentLocation.updatedAt);

      // Wait to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update location
      const timestamp = Date.now();
      await request(app.getHttpServer())
        .put(`/locations/${testLocationId}`)
        .send({ name: `Timestamp Update ${timestamp}, RJ` })
        .expect(200);

      // Get updated location
      const afterRes = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      const updatedLocation = afterRes.body.find(
        (loc: any) => loc.id === testLocationId
      );
      const afterUpdatedAt = new Date(updatedLocation.updatedAt);

      expect(afterUpdatedAt.getTime()).toBeGreaterThan(beforeUpdatedAt.getTime());
    });

    it('should validate response data types after update', async () => {
      const timestamp = Date.now();
      const updateData = {
        name: `Type Validation ${timestamp}, MG`,
      };

      const res = await request(app.getHttpServer())
        .put(`/locations/${testLocationId}`)
        .send(updateData)
        .expect(200);

      expect(typeof res.body.aux_id).toBe('number');
      expect(typeof res.body.id).toBe('string');
      expect(typeof res.body.name).toBe('string');
      expect(res.body.createdAt).toBeTruthy();
      expect(res.body.updatedAt).toBeTruthy();
    });

    it('should return 404 for non-existent location', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app.getHttpServer())
        .put(`/locations/${nonExistentId}`)
        .send({ name: 'Should Not Work' })
        .expect(404);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('not found');
    });

    it('should return 400 for empty name', async () => {
      const res = await request(app.getHttpServer())
        .put(`/locations/${testLocationId}`)
        .send({ name: '' })
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for invalid name type', async () => {
      const res = await request(app.getHttpServer())
        .put(`/locations/${testLocationId}`)
        .send({ name: 99999 })
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should preserve createdAt timestamp when updating', async () => {
      // Get original location
      const beforeRes = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      const originalLocation = beforeRes.body.find(
        (loc: any) => loc.id === testLocationId
      );
      const originalCreatedAt = new Date(originalLocation.createdAt);

      // Update location
      const timestamp = Date.now();
      await request(app.getHttpServer())
        .put(`/locations/${testLocationId}`)
        .send({ name: `Preserve CreatedAt ${timestamp}, PR` })
        .expect(200);

      // Get updated location
      const afterRes = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      const updatedLocation = afterRes.body.find(
        (loc: any) => loc.id === testLocationId
      );
      const afterCreatedAt = new Date(updatedLocation.createdAt);

      // createdAt should remain unchanged
      expect(afterCreatedAt.getTime()).toBe(originalCreatedAt.getTime());
    });
  });
});
