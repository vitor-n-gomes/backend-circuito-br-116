import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IDataMigrationWorker,
  DataMigrationResult,
} from '../interfaces/data-migration.interface.worker';
import { LegacyBusiness } from '../legacy-models/legacy-business.entity';

/**
 * Worker to extract unique locations from cadastro (cidade + estado)
 * and create them in PostgreSQL
 * 
 * Note: You'll need to create a Location entity in your PostgreSQL database
 * or adapt this to match your existing location structure
 */
@Injectable()
export class LocationExtractionWorker implements IDataMigrationWorker {
  private readonly logger = new Logger(LocationExtractionWorker.name);
  private readonly isDryRun = process.env.DRY_RUN === 'true';

  constructor(
    @InjectRepository(LegacyBusiness, 'mysql_legacy')
    private readonly legacyRepo: Repository<LegacyBusiness>,
    // TODO: Inject your Location repository here when you create the entity
    // @InjectRepository(Location)
    // private readonly locationRepo: Repository<Location>,
  ) {}

  getName(): string {
    return 'Location Extraction from cidade/estado';
  }

  async run(): Promise<DataMigrationResult> {
    const startTime = Date.now();
    const result: DataMigrationResult = {
      imported: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      durationMs: 0,
    };

    if (this.isDryRun) {
      this.logger.warn('🔍 DRY RUN MODE - No data will be written to PostgreSQL');
    }

    this.logger.log('🚀 Extracting unique locations from cadastro (cidade + estado)...');

    try {
      // Get all unique cidade/estado combinations
      const uniqueLocations = await this.legacyRepo
        .createQueryBuilder('cadastro')
        .select('cadastro.cidade', 'cidade')
        .addSelect('cadastro.estado', 'estado')
        .where('cadastro.cidade IS NOT NULL')
        .andWhere("cadastro.cidade != ''")
        .groupBy('cadastro.cidade')
        .addGroupBy('cadastro.estado')
        .orderBy('cadastro.estado', 'ASC')
        .addOrderBy('cadastro.cidade', 'ASC')
        .getRawMany();

      this.logger.log(`📊 Found ${uniqueLocations.length} unique locations`);

      // Log all locations for review
      this.logger.log('📍 Unique locations found:');
      uniqueLocations.forEach((loc, idx) => {
        this.logger.log(
          `   ${idx + 1}. ${loc.cidade}${loc.estado ? ' - ' + loc.estado : ''}`
        );
      });

      const processedLocations = new Set<string>();

      for (const row of uniqueLocations) {
        const cidade = row.cidade as string;
        const estado = row.estado as string | null;

        if (!cidade || !cidade.trim()) {
          continue;
        }

        try {
          const locationKey = `${cidade.toLowerCase().trim()}-${estado?.toLowerCase().trim() || 'no-state'}`;

          // Skip if already processed
          if (processedLocations.has(locationKey)) {
            result.skipped++;
            continue;
          }

          // TODO: Implement location creation when you have the Location entity
          // For now, just log what would be created
          
          const locationName = this.buildLocationName(cidade, estado);
          
          this.logger.debug(
            `${this.isDryRun ? '[DRY RUN] ' : '[TODO] '}Would create location: ${locationName}`
          );

          // Placeholder - replace with actual repository save when Location entity exists
          /*
          const location = this.locationRepo.create({
            name: cidade.trim(),
            city: cidade.trim(),
            state: estado?.trim().toUpperCase(),
            latitude: null, // Can be populated later or from average of businesses
            longitude: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          if (!this.isDryRun) {
            await this.locationRepo.save(location);
          }
          */

          result.imported++;
          processedLocations.add(locationKey);
        } catch (error) {
          result.failed++;
          const errorMsg = `Failed to create location "${cidade} - ${estado}": ${error.message}`;
          result.errors.push(errorMsg);
          this.logger.error(`❌ ${errorMsg}`);
        }
      }

      result.durationMs = Date.now() - startTime;

      this.logger.log(
        `✅ Location extraction completed in ${(result.durationMs / 1000).toFixed(2)}s: ` +
        `${result.imported} would be imported, ${result.skipped} skipped, ${result.failed} failed`,
      );

      this.logger.warn(
        '⚠️  Note: Location entity not implemented yet. ' +
        'Create a Location entity and update this worker to save locations.'
      );
    } catch (error) {
      this.logger.error(
        `💥 Fatal error during location extraction: ${error.message}`,
        error.stack,
      );
      result.durationMs = Date.now() - startTime;
      throw error;
    }

    return result;
  }

  /**
   * Build a readable location name
   */
  private buildLocationName(cidade: string, estado: string | null): string {
    const cidadeFormatted = cidade.trim();
    const estadoFormatted = estado?.trim().toUpperCase();

    if (estadoFormatted) {
      return `${cidadeFormatted} - ${estadoFormatted}`;
    }

    return cidadeFormatted;
  }
}
