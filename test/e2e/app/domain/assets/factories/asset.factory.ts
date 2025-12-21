import { DataSource } from 'typeorm';
import { Asset } from '@/app/infra/repositories/type-orm/models/asset.entity';
import { FactoryBuilder } from '../../factories/builder.factory';

/**
 * Factory for creating Asset entities in the database
 * Implements FactoryBuilder pattern for consistent test data seeding
 */
export class AssetFactory implements FactoryBuilder {
  assets: Partial<Asset>[];
  
  constructor(assets: Partial<Asset>[]) {
    this.assets = assets;
  }

  async run(dataSource: DataSource): Promise<Asset[]> {
    const assetRepo = dataSource.getRepository(Asset);

    // Add timestamps to entities before saving
    const assetsWithTimestamps = this.assets.map(asset => ({
      ...asset,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const listOfAssets = await assetRepo.save(assetsWithTimestamps);
    
    console.log(`✅ Factory created ${listOfAssets.length} assets successfully!`);
    
    return listOfAssets;
  }
}

/**
 * Helper interface for creating asset payloads
 */
export interface CreateAssetOptions {
  path?: string;
  size?: number;
  initialName?: string;
}

/**
 * Creates a valid asset payload with smart defaults
 * Override any field as needed for specific test cases
 * 
 * @param options - Optional fields to override defaults
 * @returns Complete asset payload ready for API requests
 * 
 * @example
 * // Minimal usage with all defaults
 * const asset = createAssetPayload();
 * 
 * @example
 * // Override specific fields
 * const asset = createAssetPayload({
 *   path: 'custom/path.jpg',
 *   size: 2048000
 * });
 */
export function createAssetPayload(
  options: CreateAssetOptions = {}
): Record<string, any> {
  const timestamp = Date.now();

  return {
    path: options.path ?? `uploads/test-asset-${timestamp}.jpg`,
    size: options.size ?? 1024000,
    initialName: options.initialName ?? `test-file-${timestamp}.jpg`,
  };
}

/**
 * Creates a minimal valid asset (only required fields)
 * Useful for testing edge cases and validation
 */
export function createMinimalAssetPayload(): Record<string, any> {
  const timestamp = Date.now();
  
  return {
    path: `uploads/minimal-${timestamp}.jpg`,
    size: 1024,
  };
}

/**
 * Creates an asset with large file size
 * Useful for testing file size handling
 */
export function createLargeAssetPayload(): Record<string, any> {
  return createAssetPayload({
    size: 10485760, // 10MB
    initialName: 'large-file.jpg',
  });
}

/**
 * Creates an asset with specific file extension
 */
export function createAssetWithExtension(extension: string): Record<string, any> {
  const timestamp = Date.now();
  
  return createAssetPayload({
    path: `uploads/test-asset-${timestamp}.${extension}`,
    initialName: `test-file.${extension}`,
  });
}

/**
 * Creates asset entity data for database seeding
 * Use this with AssetFactory for creating test data directly in the database
 */
export function createAssetEntity(options: CreateAssetOptions = {}): Partial<Asset> {
  const timestamp = Date.now();
  
  return {
    path: options.path ?? `uploads/test-asset-${timestamp}.jpg`,
    size: options.size ?? 1024000,
    initialName: options.initialName ?? `test-file-${timestamp}.jpg`,
  };
}
