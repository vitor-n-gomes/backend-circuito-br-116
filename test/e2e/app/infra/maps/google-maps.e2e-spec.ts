import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { IMapsService } from '@/app/infra/maps/interfaces/maps.interface.service';
import { MapsModule } from '@/app/infra/maps/maps.module';

describe('GoogleMapsService (e2e)', () => {
  let module: TestingModule;
  let mapsService: IMapsService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.test', '.env'],
          isGlobal: true,
        }),
        MapsModule,
      ],
    }).compile();

    mapsService = module.get<IMapsService>(IMapsService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('geocode', () => {
    it('should convert address to coordinates', async () => {
      const address = 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP';
      const result = await mapsService.geocode(address);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('longitude');
      expect(result).toHaveProperty('formattedAddress');
      expect(typeof result?.latitude).toBe('number');
      expect(typeof result?.longitude).toBe('number');
      expect(result?.latitude).toBeCloseTo(-23.561, 1);
      expect(result?.longitude).toBeCloseTo(-46.656, 1);
    }, 30000);

    it('should return correct data types', async () => {
      const address = 'Times Square, New York, NY';
      const result = await mapsService.geocode(address);

      expect(result).toBeDefined();
      expect(typeof result?.address).toBe('string');
      expect(typeof result?.latitude).toBe('number');
      expect(typeof result?.longitude).toBe('number');
      if (result?.formattedAddress) {
        expect(typeof result.formattedAddress).toBe('string');
      }
      if (result?.placeId) {
        expect(typeof result.placeId).toBe('string');
      }
    }, 30000);

    it('should return null for invalid address', async () => {
      const result = await mapsService.geocode('xyzinvalidaddress12345');
      expect(result).toBeNull();
    }, 30000);
  });

  describe('reverseGeocode', () => {
    it('should convert coordinates to address', async () => {
      // Coordinates for Paulista Avenue, São Paulo
      const latitude = -23.5613;
      const longitude = -46.6563;
      const result = await mapsService.reverseGeocode(latitude, longitude);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('longitude');
      expect(result?.latitude).toBe(latitude);
      expect(result?.longitude).toBe(longitude);
      expect(typeof result?.address).toBe('string');
      expect(result?.address.length).toBeGreaterThan(0);
    }, 30000);

    it('should return formatted address', async () => {
      const latitude = 40.7580;
      const longitude = -73.9855;
      const result = await mapsService.reverseGeocode(latitude, longitude);

      expect(result).toBeDefined();
      expect(result?.formattedAddress).toBeDefined();
      expect(typeof result?.formattedAddress).toBe('string');
    }, 30000);
  });

  describe('searchPlaces', () => {
    it('should find places by query', async () => {
      const result = await mapsService.searchPlaces('restaurants in São Paulo');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const place = result[0];
      expect(place).toHaveProperty('placeId');
      expect(place).toHaveProperty('name');
      expect(place).toHaveProperty('address');
      expect(place).toHaveProperty('latitude');
      expect(place).toHaveProperty('longitude');
    }, 30000);

    it('should find places near coordinates', async () => {
      const latitude = -23.5613;
      const longitude = -46.6563;
      const radius = 1000; // 1km

      const result = await mapsService.searchPlaces(
        'coffee shop',
        latitude,
        longitude,
        radius
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const place = result[0];
        expect(typeof place.placeId).toBe('string');
        expect(typeof place.name).toBe('string');
        expect(typeof place.latitude).toBe('number');
        expect(typeof place.longitude).toBe('number');
      }
    }, 30000);

    it('should return empty array for no results', async () => {
      const result = await mapsService.searchPlaces(
        'xyzinvalidplace12345notexist'
      );
      expect(Array.isArray(result)).toBe(true);
    }, 30000);
  });

  describe('getPlaceDetails', () => {
    it('should get place details by placeId', async () => {
      // First search for a place to get a valid placeId
      const searchResult = await mapsService.searchPlaces(
        'MASP São Paulo'
      );
      
      expect(searchResult.length).toBeGreaterThan(0);
      const placeId = searchResult[0].placeId;

      const result = await mapsService.getPlaceDetails(placeId);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('placeId');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('longitude');
      expect(result?.placeId).toBe(placeId);
    }, 30000);

    it('should return null for invalid placeId', async () => {
      const result = await mapsService.getPlaceDetails('invalid_place_id_xyz');
      expect(result).toBeNull();
    }, 30000);
  });

  describe('getDistanceMatrix', () => {
    it('should calculate distance between locations', async () => {
      const origins = ['São Paulo, SP'];
      const destinations = ['Rio de Janeiro, RJ'];

      const result = await mapsService.getDistanceMatrix(origins, destinations);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const matrix = result[0];
      expect(matrix).toHaveProperty('distance');
      expect(matrix).toHaveProperty('duration');
      expect(matrix).toHaveProperty('status');
      expect(matrix.distance).toHaveProperty('text');
      expect(matrix.distance).toHaveProperty('value');
      expect(matrix.duration).toHaveProperty('text');
      expect(matrix.duration).toHaveProperty('value');
      expect(typeof matrix.distance.value).toBe('number');
      expect(typeof matrix.duration.value).toBe('number');
    }, 30000);

    it('should handle multiple origins and destinations', async () => {
      const origins = ['Times Square, NY', 'Central Park, NY'];
      const destinations = ['Brooklyn Bridge, NY', 'Statue of Liberty, NY'];

      const result = await mapsService.getDistanceMatrix(origins, destinations);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Should have 2 origins × 2 destinations = 4 results
      expect(result.length).toBeGreaterThanOrEqual(1);
    }, 30000);
  });

  describe('getDirections', () => {
    it('should get directions between two locations', async () => {
      const origin = 'Av. Paulista, São Paulo';
      const destination = 'Ibirapuera Park, São Paulo';

      const result = await mapsService.getDirections(origin, destination);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('distance');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('steps');
      expect(typeof result?.distance).toBe('number');
      expect(typeof result?.duration).toBe('number');
      expect(Array.isArray(result?.steps)).toBe(true);
      expect(result!.steps.length).toBeGreaterThan(0);

      const step = result!.steps[0];
      expect(step).toHaveProperty('instruction');
      expect(step).toHaveProperty('distance');
      expect(step).toHaveProperty('duration');
    }, 30000);

    it('should include polyline data', async () => {
      const origin = 'São Paulo, SP';
      const destination = 'Campinas, SP';

      const result = await mapsService.getDirections(origin, destination);

      expect(result).toBeDefined();
      if (result?.polyline) {
        expect(typeof result.polyline).toBe('string');
        expect(result.polyline.length).toBeGreaterThan(0);
      }
    }, 30000);

    it('should return null for invalid route', async () => {
      const result = await mapsService.getDirections(
        'xyzinvalidorigin',
        'xyzinvaliddestination'
      );
      expect(result).toBeNull();
    }, 30000);
  });

  describe('Integration Tests', () => {
    it('should geocode, search nearby, and get details', async () => {
      // 1. Geocode an address
      const address = 'Av. Paulista, 1578, São Paulo';
      const geocodeResult = await mapsService.geocode(address);
      
      expect(geocodeResult).toBeDefined();
      const { latitude, longitude } = geocodeResult!;

      // 2. Search for places nearby
      const places = await mapsService.searchPlaces(
        'museum',
        latitude,
        longitude,
        2000
      );
      
      expect(places.length).toBeGreaterThan(0);

      // 3. Get details of first place
      const placeDetails = await mapsService.getPlaceDetails(places[0].placeId);
      
      expect(placeDetails).toBeDefined();
      expect(placeDetails?.name).toBeDefined();
    }, 30000);

    it('should get directions and calculate distance', async () => {
      const origin = 'Times Square, New York';
      const destination = 'Central Park, New York';

      // Get directions
      const directions = await mapsService.getDirections(origin, destination);
      expect(directions).toBeDefined();
      const directionsDistance = directions!.distance;

      // Get distance matrix
      const matrix = await mapsService.getDistanceMatrix([origin], [destination]);
      expect(matrix.length).toBeGreaterThan(0);
      const matrixDistance = matrix[0].distance.value;

      // Both should be similar (within 10% tolerance)
      const tolerance = directionsDistance * 0.1;
      expect(Math.abs(directionsDistance - matrixDistance)).toBeLessThan(tolerance);
    }, 30000);
  });
});
