import { DataSource } from 'typeorm';
import { Location } from '@/app/infra/repositories/type-orm/models/location.entity';
import { FactoryBuilder } from '../../factories/builder.factory';

/**
 * Factory for creating Location entities in the database
 * Implements FactoryBuilder pattern for consistent test data seeding
 */
export class LocationFactory implements FactoryBuilder {
  entities: Partial<Location>[];
  
  constructor(entities: Partial<Location>[]) {
    this.entities = entities;
  }

  async run(dataSource: DataSource): Promise<Location[]> {
    const locationRepo = dataSource.getRepository(Location);
    
    const savedEntities: Location[] = [];
    
    for (const entityData of this.entities) {
      const entity = locationRepo.create({
        ...entityData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      const saved = await locationRepo.save(entity);
      savedEntities.push(saved);
    }
    
    return savedEntities;
  }
}

/**
 * Helper interface for creating location payloads
 */
export interface CreateLocationOptions {
  name?: string;
}

/**
 * Creates a valid location payload with smart defaults
 * Override any field as needed for specific test cases
 * 
 * @param options - Optional fields to override defaults
 * @returns Complete location payload ready for API requests
 * 
 * @example
 * // Minimal usage with all defaults
 * const location = createLocationPayload();
 * 
 * @example
 * // Override specific fields
 * const location = createLocationPayload({
 *   name: 'Custom Location, BR'
 * });
 */
export function createLocationPayload(
  options: CreateLocationOptions = {}
): Record<string, any> {
  const timestamp = Date.now();

  return {
    name: options.name ?? `Test Location ${timestamp}, BR`,
  };
}

/**
 * Creates a minimal valid location (only required fields)
 * Useful for testing edge cases and validation
 */
export function createMinimalLocationPayload(): Record<string, any> {
  return {
    name: 'Minimal Location',
  };
}

/**
 * Creates location data for database seeding
 * Use this with LocationFactory for creating test data directly in the database
 * 
 * @example
 * const locationData = createLocationEntity({ name: 'São Paulo, SP' });
 * const factory = new LocationFactory([locationData]);
 * const [created] = await runFactories(factory);
 */
export function createLocationEntity(options: CreateLocationOptions = {}): Partial<Location> {
  const timestamp = Date.now();
  
  return {
    name: options.name ?? `Test Location ${timestamp}, BR`,
    // Don't set createdAt/updatedAt here - factory handles it
  };
}

/**
 * Creates location with specific city format
 * Useful for testing consistent formatting
 */
export function createLocationWithCity(city: string, state: string): Record<string, any> {
  return createLocationPayload({
    name: `${city}, ${state}`,
  });
}
