import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Factory interface for database seeding operations
 */
export interface FactoryBuilder {
  run(dataSource: DataSource): Promise<any>;
}

/**
 * Creates a DataSource configuration for E2E tests
 */
function createDataSourceConfig(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: ['src/app/infra/repositories/type-orm/models/**/*.entity.{ts,js}'],
    synchronize: false,
    logging: false,
    ssl: process.env.DB_HOST?.includes('rds.amazonaws.com')
      ? { rejectUnauthorized: false }
      : false,
  };
}

/**
 * Runs multiple factory instances sequentially with proper error handling
 * @param factories - Array of factory instances to execute
 */
export async function runFactories(factory: FactoryBuilder): Promise<any[]> {
  const dataSource = new DataSource(createDataSourceConfig());

  try {
    console.log('🌱 Starting database seeding...\n');

    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    console.log('\n🏢 Running factories...');

    const results = await factory.run(dataSource);

    console.log('\n✅ All seeds completed successfully!');
    return results;

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n👋 Database connection closed');
      // Give connections time to fully close
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

/**
 * Creates and returns a DataSource instance for E2E tests
 * Useful for individual test operations
 */
export function createDataSource(): DataSource {
  return new DataSource(createDataSourceConfig());
}

/**
 * Generic cleanup function to delete test data by IDs
 * @param entityClass - The entity class (e.g., Location, Business, etc.)
 * @param ids - Array of aux_id values to delete
 * @param idField - Field name to filter by (defaults to 'aux_id')
 * 
 * @example
 * // Delete locations by aux_id
 * await flushTestData(Location, [1, 2, 3]);
 * 
 * @example
 * // Delete businesses by custom field
 * await flushTestData(Business, [10, 20], 'id');
 */
export async function flushTestData<T>(
  entityClass: new () => T,
  ids: number[] | string[],
  idField: string = 'aux_id'
): Promise<void> {
  if (!ids || ids.length === 0) {
    return;
  }

  const dataSource = createDataSource();

  try {
    await dataSource.initialize();
    const repository = dataSource.getRepository(entityClass);
    
    await repository
      .createQueryBuilder()
      .delete()
      .where(`${idField} IN (:...ids)`, { ids })
      .execute();

  } catch (error) {
    console.warn(`Warning: Failed to clean up test data:`, error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
