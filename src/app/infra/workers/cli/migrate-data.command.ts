import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { BusinessMigrationWorker } from '../business-migration.worker';
import { CategoryMigrationWorker } from '../category-migration.worker';
import { CategoryExtractionWorker } from '../category-extraction.worker';
import { LocationExtractionWorker } from '../location-extraction.worker';
import { PhotoMigrationWorker } from '../photo-migration.worker';
import { IDataMigrationWorker } from '../interfaces/data-migration.interface.worker';

/**
 * CLI Command to execute data migrations from MySQL to PostgreSQL
 * Usage:
 *   npm run migrate:data                 # Run all migrations
 *   npm run migrate:data business        # Run only business migration
 *   npm run migrate:data category        # Run only category migration
 *   npm run migrate:data photos          # Run only photo migration
 *   DRY_RUN=true npm run migrate:data    # Dry run mode (no writes)
 */
async function bootstrap() {
  const logger = new Logger('DataMigrationCLI');
  const args = process.argv.slice(2);
  const isDryRun = process.env.DRY_RUN === 'true';

  logger.log('═══════════════════════════════════════════════════════════');
  logger.log('🔄 Circuito BR-116 - Data Migration Tool');
  logger.log('   MySQL → PostgreSQL');
  logger.log('═══════════════════════════════════════════════════════════');

  if (isDryRun) {
    logger.warn('⚠️  DRY RUN MODE - No data will be written');
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  try {
    // Get all available workers
    const availableWorkers: { [key: string]: IDataMigrationWorker } = {
      'extract-categories': app.get(CategoryExtractionWorker),
      'extract-locations': app.get(LocationExtractionWorker),
      category: app.get(CategoryMigrationWorker),
      business: app.get(BusinessMigrationWorker),
      photos: app.get(PhotoMigrationWorker),
    };

    // Determine which workers to run
    let workersToRun: IDataMigrationWorker[] = [];

    if (args.length > 0) {
      // Run specific workers
      for (const arg of args) {
        const worker = availableWorkers[arg.toLowerCase()];
        if (worker) {
          workersToRun.push(worker);
        } else {
          logger.warn(`⚠️  Unknown migration type: ${arg}`);
          logger.log(`   Available: ${Object.keys(availableWorkers).join(', ')}`);
        }
      }
    } else {
      // Run all workers in correct order:
      // 1. Extract categories from cadastro.palavrachave
      // 2. Extract locations from cadastro.cidade/estado
      // 3. Import businesses (references categories and locations)
      workersToRun = [
        availableWorkers['extract-categories'],
        availableWorkers['extract-locations'],
        availableWorkers.business,
      ];
    }

    if (workersToRun.length === 0) {
      logger.error('❌ No valid migrations specified');
      logger.log(`   Usage: npm run migrate:data [${Object.keys(availableWorkers).join('|')}]`);
      process.exit(1);
    }

    // Execute migrations
    const startTime = Date.now();
    const totalResults = {
      imported: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const worker of workersToRun) {
      logger.log('');
      logger.log('───────────────────────────────────────────────────────────');
      logger.log(`🚀 Starting: ${worker.getName()}`);
      logger.log('───────────────────────────────────────────────────────────');

      const result = await worker.run();

      totalResults.imported += result.imported;
      totalResults.failed += result.failed;
      totalResults.skipped += result.skipped;
      totalResults.errors.push(...result.errors);

      logger.log('');
      logger.log(`✅ ${worker.getName()} completed:`);
      logger.log(`   ✓ Imported: ${result.imported}`);
      logger.log(`   ⊘ Skipped:  ${result.skipped}`);
      logger.log(`   ✗ Failed:   ${result.failed}`);
      logger.log(`   ⏱ Duration: ${(result.durationMs / 1000).toFixed(2)}s`);
    }

    const totalDuration = Date.now() - startTime;

    // Final summary
    logger.log('');
    logger.log('═══════════════════════════════════════════════════════════');
    logger.log('📊 MIGRATION SUMMARY');
    logger.log('═══════════════════════════════════════════════════════════');
    logger.log(`   Total Imported: ${totalResults.imported}`);
    logger.log(`   Total Skipped:  ${totalResults.skipped}`);
    logger.log(`   Total Failed:   ${totalResults.failed}`);
    logger.log(`   Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);

    if (totalResults.errors.length > 0) {
      logger.log('');
      logger.log('⚠️  ERRORS ENCOUNTERED:');
      totalResults.errors.slice(0, 10).forEach((error, idx) => {
        logger.error(`   ${idx + 1}. ${error}`);
      });
      if (totalResults.errors.length > 10) {
        logger.warn(`   ... and ${totalResults.errors.length - 10} more errors`);
      }
    }

    logger.log('═══════════════════════════════════════════════════════════');

    if (totalResults.failed > 0) {
      logger.warn(`⚠️  Migration completed with ${totalResults.failed} failures`);
      process.exit(1);
    } else {
      logger.log('✅ Migration completed successfully!');
      process.exit(0);
    }
  } catch (error) {
    logger.error('💥 Fatal error during migration:');
    logger.error(error.message);
    logger.error(error.stack);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run the migration
bootstrap();
