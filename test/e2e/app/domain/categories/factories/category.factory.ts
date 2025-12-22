import { DataSource } from 'typeorm';
import { Category } from '@/app/infra/repositories/type-orm/models/category.entity';
import { FactoryBuilder } from '../../factories/builder.factory';

/**
 * Factory for creating Category entities in the database
 * Implements FactoryBuilder pattern for consistent test data seeding
 */
export class CategoryFactory implements FactoryBuilder {
  entities: Partial<Category>[];
  
  constructor(entities: Partial<Category>[]) {
    this.entities = entities;
  }

  async run(dataSource: DataSource): Promise<Category[]> {
    const categoryRepo = dataSource.getRepository(Category);

    // CRITICAL: Explicitly set timestamps for entities
    // TypeORM decorators alone may not populate these reliably
    const entitiesWithTimestamps = this.entities.map(entity => ({
      ...entity,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const savedEntities = await categoryRepo.save(entitiesWithTimestamps);
    
    console.log(`✅ Factory created ${savedEntities.length} categories successfully!`);
    
    return savedEntities;
  }
}

/**
 * Helper interface for creating category payloads
 */
export interface CreateCategoryOptions {
  name?: Record<string, string>;
  details?: Record<string, string>;
  icon?: string;
  assetId?: string;
  remoteIconUrl?: string;
  parentCategoryId?: string;
}

/**
 * Creates a valid category payload with smart defaults
 * Override any field as needed for specific test cases
 * 
 * @param options - Optional fields to override defaults
 * @returns Complete category payload ready for API requests
 * 
 * @example
 * // Minimal usage with all defaults
 * const category = createCategoryPayload();
 * 
 * @example
 * // Override specific fields
 * const category = createCategoryPayload({
 *   name: { en: 'Custom Category', pt: 'Categoria Customizada' }
 * });
 */
export function createCategoryPayload(
  options: CreateCategoryOptions = {}
): Record<string, any> {
  const timestamp = Date.now();

  return {
    name: options.name ?? {
      en: `Test Category ${timestamp}`,
      pt: `Categoria Teste ${timestamp}`,
      es: `Categoría de Prueba ${timestamp}`,
    },
    details: options.details ?? {
      en: `Details for test category ${timestamp}`,
      pt: `Detalhes da categoria de teste ${timestamp}`,
    },
    icon: options.icon ?? 'test-icon',
    assetId: options.assetId ?? null,
    remoteIconUrl: options.remoteIconUrl ?? null,
    parentCategoryId: options.parentCategoryId ?? null,
  };
}

/**
 * Creates a minimal valid category (only required fields)
 * Useful for testing edge cases and validation
 */
export function createMinimalCategoryPayload(): Record<string, any> {
  return {
    name: {
      en: `Minimal Category ${Date.now()}`,
    },
  };
}

/**
 * Creates category data for database seeding
 * Use this with CategoryFactory for creating test data directly in the database
 * 
 * @example
 * const categoryData = createCategoryEntity({ name: { en: 'Test' } });
 * const factory = new CategoryFactory([categoryData]);
 * const [created] = await runFactories(factory);
 */
export function createCategoryEntity(options: CreateCategoryOptions = {}): Partial<Category> {
  const timestamp = Date.now();
  
  return {
    name: options.name ?? {
      en: `Test Category ${timestamp}`,
      pt: `Categoria Teste ${timestamp}`,
    },
    details: options.details ?? {
      en: `Test details ${timestamp}`,
    },
    icon: options.icon ?? 'test-icon',
    assetId: options.assetId ?? null,
    remoteIconUrl: options.remoteIconUrl ?? null,
    // Don't set createdAt/updatedAt here - factory handles it
  };
}

/**
 * Creates category with specific language only
 * Useful for testing internationalization
 */
export function createCategoryWithSingleLanguage(
  language: string = 'en',
  categoryName: string = 'Test Category'
): Record<string, any> {
  return createCategoryPayload({
    name: {
      [language]: `${categoryName} ${Date.now()}`,
    },
  });
}

/**
 * Creates parent category with subcategories
 * Useful for testing hierarchical relationships
 */
export function createParentCategoryPayload(): Record<string, any> {
  const timestamp = Date.now();
  
  return createCategoryPayload({
    name: {
      en: `Parent Category ${timestamp}`,
      pt: `Categoria Pai ${timestamp}`,
    },
  });
}

/**
 * Creates subcategory linked to a parent
 */
export function createSubcategoryPayload(parentCategoryId: string): Record<string, any> {
  const timestamp = Date.now();
  
  return createCategoryPayload({
    name: {
      en: `Subcategory ${timestamp}`,
      pt: `Subcategoria ${timestamp}`,
    },
    parentCategoryId,
  });
}
