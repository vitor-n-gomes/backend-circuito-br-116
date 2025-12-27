import { Injectable, Logger } from '@nestjs/common';
import { LegacyCategory } from '../legacy-models/legacy-category.entity';

/**
 * Mapper for Category data from MySQL to PostgreSQL
 */
@Injectable()
export class CategoryMigrationMapper {
  private readonly logger = new Logger(CategoryMigrationMapper.name);

  /**
   * Maps legacy MySQL category data to our PostgreSQL Category entity structure
   */
  mapToEntity(legacy: LegacyCategory): any {
    return {
      name: this.sanitizeString(legacy.name) || 'Categoria Importada',
      description: this.sanitizeString(legacy.description),
      iconUrl: this.sanitizeString(legacy.iconUrl),
      createdAt: legacy.createdAt || new Date(),
      updatedAt: legacy.updatedAt || new Date(),
    };
  }

  /**
   * Sanitize string - trim and handle nulls
   */
  private sanitizeString(value: string | null | undefined): string | undefined {
    if (!value || value.trim() === '') return undefined;
    return value.trim();
  }

  /**
   * Generate unique key for duplicate detection
   */
  generateUniqueKey(legacy: LegacyCategory): string {
    return legacy.name?.toLowerCase().trim() || `category-${legacy.id}`;
  }
}
