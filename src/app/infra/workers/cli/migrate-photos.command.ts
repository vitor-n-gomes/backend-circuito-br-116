import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { PhotoMigrationWorker } from '../photo-migration.worker';

async function bootstrap() {
  const logger = new Logger('PhotoMigrationCLI');
  
  logger.log('═══════════════════════════════════════════════════════════');
  logger.log('📸 Circuito BR-116 - Photo Migration Tool');
  logger.log('   Legacy Photos → AWS S3 → PostgreSQL');
  logger.log('═══════════════════════════════════════════════════════════');

  if (process.env.DRY_RUN === 'true') {
    logger.warn('⚠️  DRY RUN MODE - No data will be written');
  }

  try {
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['log', 'error', 'warn'],
    });

    const worker = app.get(PhotoMigrationWorker);
    
    logger.log('');
    logger.log('──────────────────────────────────────────────────────────');
    logger.log('🚀 Starting: Photo Migration from oldFields.originalPhoto');
    logger.log('──────────────────────────────────────────────────────────');
    
    const result = await worker.run();
    
    logger.log('');
    logger.log('✅ Photo Migration completed:');
    logger.log(`   ✓ Imported: ${result.imported}`);
    logger.log(`   ⊘ Skipped:  ${result.skipped}`);
    logger.log(`   ✗ Failed:   ${result.failed}`);
    logger.log(`   ⏱ Duration: ${(result.durationMs / 1000).toFixed(2)}s`);
    logger.log('');
    
    if (result.errors.length > 0) {
      logger.log('❌ Errors encountered:');
      result.errors.slice(0, 10).forEach((error, index) => {
        logger.error(`   ${index + 1}. ${error}`);
      });
      if (result.errors.length > 10) {
        logger.error(`   ... and ${result.errors.length - 10} more errors`);
      }
      logger.log('');
    }

    logger.log('═══════════════════════════════════════════════════════════');
    logger.log('📊 MIGRATION SUMMARY');
    logger.log('═══════════════════════════════════════════════════════════');
    logger.log(`   Total Imported: ${result.imported}`);
    logger.log(`   Total Skipped:  ${result.skipped}`);
    logger.log(`   Total Failed:   ${result.failed}`);
    logger.log(`   Total Duration: ${(result.durationMs / 1000).toFixed(2)}s`);
    logger.log('═══════════════════════════════════════════════════════════');
    
    if (result.failed === 0) {
      logger.log('✅ Migration completed successfully!');
    } else {
      logger.warn(`⚠️  Migration completed with ${result.failed} failures`);
    }

    await app.close();
    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    logger.error('❌ Photo migration failed:', error);
    process.exit(1);
  }
}

bootstrap();