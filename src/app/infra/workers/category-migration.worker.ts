import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IDataMigrationWorker,
  DataMigrationResult,
} from './interfaces/data-migration.interface.worker';
import { LegacyCategory } from './legacy-models/legacy-category.entity';
import { Category } from '../repositories/type-orm/models/category.entity';
import { CategoryMigrationMapper } from './mappers/category-migration.mapper';

/**
 * Worker to migrate category data from MySQL to PostgreSQL
 */
@Injectable()
export class CategoryMigrationWorker implements IDataMigrationWorker {
  private readonly logger = new Logger(CategoryMigrationWorker.name);
  private readonly BATCH_SIZE = 50;
  private readonly isDryRun = process.env.DRY_RUN === 'true';

  constructor(
    @InjectRepository(LegacyCategory, 'mysql_legacy')
    private readonly legacyRepo: Repository<LegacyCategory>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    private readonly mapper: CategoryMigrationMapper,
  ) {}

  getName(): string {
    return 'Category Migration';
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

    this.logger.log('🚀 Starting Category migration from MySQL to PostgreSQL...');

    try {
      const total = await this.legacyRepo.count();
      this.logger.log(`📊 Found ${total} categories to migrate`);

      if (total === 0) {
        this.logger.warn('⚠️  No categories found in legacy database');
        result.durationMs = Date.now() - startTime;
        return result;
      }

      const processedKeys = new Set<string>();
      const batches = Math.ceil(total / this.BATCH_SIZE);

      for (let i = 0; i < batches; i++) {
        const offset = i * this.BATCH_SIZE;
        const legacyCategories = await this.legacyRepo.find({
          skip: offset,
          take: this.BATCH_SIZE,
          order: { id: 'ASC' },
        });

        this.logger.log(
          `📦 Processing batch ${i + 1}/${batches} (${legacyCategories.length} items)`,
        );

        for (const legacy of legacyCategories) {
          try {
            const uniqueKey = this.mapper.generateUniqueKey(legacy);

            if (processedKeys.has(uniqueKey)) {
              this.logger.debug(`⏭️  Skipping duplicate: ${legacy.name}`);
              result.skipped++;
              continue;
            }

            const existing = await this.categoryRepo
              .createQueryBuilder('category')
              .where("category.name->>'pt' = :name", { name: legacy.name })
              .getOne();

            if (existing) {
              this.logger.debug(`⏭️  Skipping existing: ${legacy.name}`);
              result.skipped++;
              processedKeys.add(uniqueKey);
              continue;
            }

            const mappedData = this.mapper.mapToEntity(legacy);
            const category = this.categoryRepo.create(mappedData);

            if (!this.isDryRun) {
              await this.categoryRepo.save(category);
            }

            result.imported++;
            processedKeys.add(uniqueKey);

            this.logger.debug(`✅ ${this.isDryRun ? '[DRY RUN] ' : ''}Imported: ${legacy.name}`);
          } catch (error) {
            result.failed++;
            const errorMsg = `Failed to import ${legacy.name}: ${error.message}`;
            result.errors.push(errorMsg);
            this.logger.error(`❌ ${errorMsg}`);
          }
        }
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
}
