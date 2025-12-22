import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { LocationSeed } from './location.seed';
import { BusinessSeed } from './business.seed';

// Load environment variables
config();

const dataSource = new DataSource({
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
});

async function runSeeds() {
  try {
    console.log('🌱 Starting database seeding...\n');

    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    // Run seeds in order (locations first, then businesses that depend on them)
    console.log('📍 Seeding locations...');
    const locationSeed = new LocationSeed();
    await locationSeed.run(dataSource);
    
    console.log('\n🏢 Seeding businesses...');
    const businessSeed = new BusinessSeed();
    await businessSeed.run(dataSource);

    console.log('\n✅ All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('\n👋 Database connection closed');
  }
}

runSeeds();
