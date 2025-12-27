import { Injectable, Logger } from '@nestjs/common';
import { LegacyLocation } from '../legacy-models/legacy-location.entity';

/**
 * Mapper for Location data from MySQL to PostgreSQL
 */
@Injectable()
export class LocationMigrationMapper {
  private readonly logger = new Logger(LocationMigrationMapper.name);

  /**
   * Maps legacy MySQL location data to our PostgreSQL Location entity structure
   */
  mapToEntity(legacy: LegacyLocation): any {
    return {
      name: this.sanitizeString(legacy.name) || 'Localização Importada',
      state: this.sanitizeString(legacy.state),
      city: this.sanitizeString(legacy.city),
      latitude: this.sanitizeNumber(legacy.latitude),
      longitude: this.sanitizeNumber(legacy.longitude),
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
   * Sanitize number with optional null
   */
  private sanitizeNumber(value: number | null | undefined): number | undefined {
    if (value === null || value === undefined || isNaN(value)) {
      return undefined;
    }
    return Number(value);
  }

  /**
   * Generate unique key for duplicate detection
   */
  generateUniqueKey(legacy: LegacyLocation): string {
    return `${legacy.city?.toLowerCase()}-${legacy.state?.toLowerCase()}`.trim() || 
      `location-${legacy.id}`;
  }
}
