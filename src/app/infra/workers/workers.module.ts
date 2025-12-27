import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MySQLConnectionModule } from './mysql-connection.module';
import { TypeOrmRepositoryModule } from '../repositories/type-orm/typeorm.repository.module';

// Legacy MySQL entities
import { LegacyBusiness } from './legacy-models/legacy-business.entity';
import { LegacyCategory } from './legacy-models/legacy-category.entity';
import { LegacyLocation } from './legacy-models/legacy-location.entity';

// PostgreSQL entities
import { Business } from '../repositories/type-orm/models/business.entity';
import { Category } from '../repositories/type-orm/models/category.entity';

// Workers
import { BusinessMigrationWorker } from './business-migration.worker';
import { CategoryMigrationWorker } from './category-migration.worker';
import { CategoryExtractionWorker } from './category-extraction.worker';
import { LocationExtractionWorker } from './location-extraction.worker';
import { PhotoMigrationWorker } from './photo-migration.worker';

// Mappers
import { BusinessMigrationMapper } from './mappers/business-migration.mapper';
import { CategoryMigrationMapper } from './mappers/category-migration.mapper';
import { LocationMigrationMapper } from './mappers/location-migration.mapper';

/**
 * Workers Module
 * Handles data migration from legacy MySQL database to PostgreSQL
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.test', '.env'],
      isGlobal: true,
    }),
    MySQLConnectionModule,
    TypeOrmRepositoryModule,
    // PostgreSQL entities
    TypeOrmModule.forFeature([Business, Category]),
    // MySQL legacy entities (named connection)
    TypeOrmModule.forFeature(
      [LegacyBusiness, LegacyCategory, LegacyLocation],
      'mysql_legacy',
    ),
  ],
  providers: [
    // Mappers
    BusinessMigrationMapper,
    CategoryMigrationMapper,
    LocationMigrationMapper,
    
    // Workers
    CategoryExtractionWorker,
    LocationExtractionWorker,
    BusinessMigrationWorker,
    CategoryMigrationWorker,
    PhotoMigrationWorker,
  ],
  exports: [
    CategoryExtractionWorker,
    LocationExtractionWorker,
    BusinessMigrationWorker,
    CategoryMigrationWorker,
    PhotoMigrationWorker,
  ],
})
export class WorkersModule {}
