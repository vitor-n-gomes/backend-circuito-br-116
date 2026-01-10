import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { LocationFactory, createLocationEntity } from '../factories/location.factory';
import { runFactories } from '../../factories/builder.factory';

describe('LocationController - Delete Location (e2e)', () => {
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

  describe('DELETE /locations/:id', () => {
    it('should delete an existing location', async () => {
      // Create location to delete
      const factory = new LocationFactory([
        createLocationEntity({ name: 'E2E Delete Test Location 1' }),
      ]);
      const [createdLocation] = await runFactories(factory);
      const locationId = createdLocation.id;

      // Delete it
      const res = await request(app.getHttpServer())
        .delete(`/locations/${locationId}`)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);

      // Verify deletion - location should not be in the list
      const listRes = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      const deletedLocation = listRes.body.find(
        (loc: any) => loc.id === locationId
      );
      expect(deletedLocation).toBeUndefined();
    });

    it('should return correct response structure on successful delete', async () => {
      // Create location to delete
      const factory = new LocationFactory([
        createLocationEntity({ name: 'E2E Delete Test Location 2' }),
      ]);
      const [createdLocation] = await runFactories(factory);

      const res = await request(app.getHttpServer())
        .delete(`/locations/${createdLocation.id}`)
        .expect(200);

      expect(res.body).toEqual({ success: true });
      expect(typeof res.body.success).toBe('boolean');
    });

    it('should return 404 for non-existent location', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app.getHttpServer())
        .delete(`/locations/${nonExistentId}`)
        .expect(404);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('not found');
    });

    it('should return 404 when trying to delete already deleted location', async () => {
      // Create location
      const factory = new LocationFactory([
        createLocationEntity({ name: 'E2E Delete Test Location 3' }),
      ]);
      const [createdLocation] = await runFactories(factory);
      const locationId = createdLocation.id;

      // Delete it first time
      await request(app.getHttpServer())
        .delete(`/locations/${locationId}`)
        .expect(200);

      // Try to delete again
      const res = await request(app.getHttpServer())
        .delete(`/locations/${locationId}`)
        .expect(404);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('not found');
    });

    it('should return 400 for malformed UUID', async () => {
      const malformedId = 'not-a-valid-uuid';

      await request(app.getHttpServer())
        .delete(`/locations/${malformedId}`)
        .expect(400); // UUID validation fails before hitting the database
    });

    it('should only delete specified location', async () => {
      // Create multiple locations
      const factory = new LocationFactory([
        createLocationEntity({ name: 'E2E Keep Location 1' }),
        createLocationEntity({ name: 'E2E Keep Location 2' }),
        createLocationEntity({ name: 'E2E Delete Location' }),
      ]);
      const createdLocations = await runFactories(factory);
      const [keepLoc1, keepLoc2, deleteLoc] = createdLocations;

      // Delete only one
      await request(app.getHttpServer())
        .delete(`/locations/${deleteLoc.id}`)
        .expect(200);

      // Verify others still exist
      const listRes = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      const location1Exists = listRes.body.some(
        (loc: any) => loc.id === keepLoc1.id
      );
      const location2Exists = listRes.body.some(
        (loc: any) => loc.id === keepLoc2.id
      );
      const deletedLocationExists = listRes.body.some(
        (loc: any) => loc.id === deleteLoc.id
      );

      expect(location1Exists).toBe(true);
      expect(location2Exists).toBe(true);
      expect(deletedLocationExists).toBe(false);

      // Cleanup
      await request(app.getHttpServer()).delete(`/locations/${keepLoc1.id}`);
      await request(app.getHttpServer()).delete(`/locations/${keepLoc2.id}`);
    });
  });
});
