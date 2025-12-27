import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IDataMigrationWorker,
  DataMigrationResult,
} from './interfaces/data-migration.interface.worker';
import { LegacyBusiness } from './legacy-models/legacy-business.entity';
import { Business } from '../repositories/type-orm/models/business.entity';
import { Category } from '../repositories/type-orm/models/category.entity';
import { BusinessMigrationMapper } from './mappers/business-migration.mapper';

/**
 * Worker to migrate business data from MySQL cadastro to PostgreSQL
 * IMPORTANT: Run after CategoryExtractionWorker and LocationExtractionWorker
 */
@Injectable()
export class BusinessMigrationWorker implements IDataMigrationWorker {
  private readonly logger = new Logger(BusinessMigrationWorker.name);
  private readonly BATCH_SIZE = 100;
  private readonly DEFAULT_ACCOUNT_ID = 1;
  private readonly DEFAULT_LOCATION_ID = 1;
  private readonly DEFAULT_CATEGORY_ID = 1;
  private readonly DEFAULT_CLASSIFICATION = 'A1';
  private readonly isDryRun = process.env.DRY_RUN === 'true';

  // Cache for category lookups
  private categoryCache = new Map<string, number>();

  constructor(
    @InjectRepository(LegacyBusiness, 'mysql_legacy')
    private readonly legacyRepo: Repository<LegacyBusiness>,

    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    private readonly mapper: BusinessMigrationMapper,
  ) {}

  getName(): string {
    return 'Business Migration from cadastro';
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

    this.logger.log('🚀 Starting Business migration from MySQL cadastro to PostgreSQL...');
    this.logger.log('⚠️  Make sure you ran CategoryExtractionWorker first!');

    try {
      // Preload category cache
      await this.loadCategoryCache();

      // Get total count from MySQL
      const total = await this.legacyRepo.count();
      this.logger.log(`📊 Found ${total} businesses to migrate`);

      if (total === 0) {
        this.logger.warn('⚠️  No businesses found in legacy database');
        result.durationMs = Date.now() - startTime;
        return result;
      }

      // Track duplicates
      const processedKeys = new Set<string>();

      // Process in batches
      const batches = Math.ceil(total / this.BATCH_SIZE);

      for (let i = 0; i < batches; i++) {
        const offset = i * this.BATCH_SIZE;
        const legacyBusinesses = await this.legacyRepo.find({
          skip: offset,
          take: this.BATCH_SIZE,
          order: { codcadastro: 'ASC' },
        });

        this.logger.log(
          `📦 Processing batch ${i + 1}/${batches} (${legacyBusinesses.length} items)`,
        );

        for (const legacy of legacyBusinesses) {
          try {
            // Generate unique key for duplicate detection
            const uniqueKey = this.mapper.generateUniqueKey(legacy);

            // Check if already processed in this run
            if (processedKeys.has(uniqueKey)) {
              this.logger.debug(`⏭️  Skipping duplicate in batch: ${legacy.empresa}`);
              result.skipped++;
              continue;
            }

            // Check if already exists in PostgreSQL
            const existing = await this.businessRepo.findOne({
              where: [
                { title: legacy.empresa },
                ...(legacy.email ? [{ email: legacy.email }] : []),
              ],
            });

            if (existing) {
              this.logger.debug(`⏭️  Skipping existing: ${legacy.empresa}`);
              result.skipped++;
              processedKeys.add(uniqueKey);
              continue;
            }

            // Resolve category ID from palavrachave
            const categoryId = await this.resolveCategoryId(legacy.palavrachave);

            // Map legacy data to new entity
            const mappedData = this.mapper.mapToEntity(legacy, {
              accountId: this.DEFAULT_ACCOUNT_ID,
              locationId: this.DEFAULT_LOCATION_ID,
              categoryId: categoryId || this.DEFAULT_CATEGORY_ID,
            });

            // Create business entity
            const business = this.businessRepo.create({
              ...mappedData,
              classification: this.DEFAULT_CLASSIFICATION,
              vectors: null,
            });

            // Save to PostgreSQL (unless dry run)
            if (!this.isDryRun) {
              await this.businessRepo.save(business);
            }

            result.imported++;
            processedKeys.add(uniqueKey);

            this.logger.debug(
              `✅ ${this.isDryRun ? '[DRY RUN] ' : ''}Imported: ${legacy.empresa} ` +
              `(categoria: ${categoryId || 'default'})`
            );
          } catch (error) {
            result.failed++;
            const errorMsg = `Failed to import ${legacy.empresa}: ${error.message}`;
            result.errors.push(errorMsg);
            this.logger.error(`❌ ${errorMsg}`);
          }
        }

        // Progress update
        const processed = result.imported + result.failed + result.skipped;
        const percentage = ((processed / total) * 100).toFixed(1);
        this.logger.log(`📈 Progress: ${processed}/${total} (${percentage}%)`);
      }

      result.durationMs = Date.now() - startTime;

      this.logger.log(
        `✅ Migration completed in ${(result.durationMs / 1000).toFixed(2)}s: ` +
        `${result.imported} imported, ${result.skipped} skipped, ${result.failed} failed`,
      );
    } catch (error) {
      this.logger.error(
        `💥 Fatal error during migration: ${error.message}`,
        error.stack,
      );
      result.durationMs = Date.now() - startTime;
      throw error;
    }

    return result;
  }

  /**
   * Preload all categories into cache for faster lookups
   */
  private async loadCategoryCache(): Promise<void> {
    this.logger.log('📦 Loading category cache...');
    
    const categories = await this.categoryRepo.find();
    
    for (const category of categories) {
      const namePt = category.name['pt']?.toLowerCase().trim();
      if (namePt) {
        this.categoryCache.set(namePt, category.aux_id);
      }
    }

    this.logger.log(`✅ Loaded ${this.categoryCache.size} categories into cache`);
  }

  /**
   * Resolve category ID from palavrachave
   * Returns the matching category aux_id or undefined
   */
  private async resolveCategoryId(palavrachave: string | null | undefined): Promise<number | undefined> {
    if (!palavrachave || !palavrachave.trim()) {
      return undefined;
    }

    // Normalize palavrachave: replace underscores with spaces
    const normalized = palavrachave
      .trim()
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .toLowerCase();

    // Check cache first
    const cachedId = this.categoryCache.get(normalized);
    if (cachedId) {
      return cachedId;
    }

    // If not in cache, try to find in database
    const category = await this.categoryRepo
      .createQueryBuilder('category')
      .where("LOWER(category.name->>'pt') = :name", { name: normalized })
      .getOne();

    if (category) {
      // Add to cache for future lookups
      this.categoryCache.set(normalized, category.aux_id);
      return category.aux_id;
    }

    this.logger.debug(`⚠️  Category not found for palavrachave: "${palavrachave}"`);
    return undefined;
  }
}
