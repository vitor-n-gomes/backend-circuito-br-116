# Data Migration Worker - MySQL to PostgreSQL

This module provides a complete data migration system to import data from a legacy MySQL database into the new PostgreSQL database.

## Overview

The migration system follows Clean Architecture principles and includes:
- **Legacy Entity Models**: TypeORM entities for MySQL tables
- **Data Mappers**: Transform legacy data to match new schema
- **Migration Workers**: Execute batch imports with error handling
- **CLI Commands**: Easy-to-use command-line interface

## Architecture

```
src/app/infra/workers/
├── cli/
│   └── migrate-data.command.ts       # CLI entry point
├── interfaces/
│   └── data-migration.interface.worker.ts
├── legacy-models/                     # MySQL entities
│   ├── legacy-business.entity.ts
│   ├── legacy-category.entity.ts
│   └── legacy-location.entity.ts
├── mappers/                           # Data transformation
│   ├── business-migration.mapper.ts
│   ├── category-migration.mapper.ts
│   └── location-migration.mapper.ts
├── business-migration.worker.ts       # Workers
├── category-migration.worker.ts
├── mysql-connection.module.ts         # MySQL connection config
└── workers.module.ts                  # Module registration
```

## Setup

### 1. Install MySQL Driver

The `mysql2` driver is already added to package.json:

```bash
npm install
```

### 2. Configure Environment Variables

Add MySQL connection details to your `.env` file:

```bash
# MySQL Legacy Database Configuration
MYSQL_HOST=your-mysql-host.com
MYSQL_PORT=3306
MYSQL_USER=readonly_user
MYSQL_PASS=your_secure_password
MYSQL_DB=legacy_database_name
MYSQL_LOGGING=false  # Set to 'true' for SQL query logging
```

### 3. Verify Legacy Database Structure

Ensure your MySQL tables match the entity definitions in `legacy-models/`. If your table structure differs, update the entities accordingly.

## Usage

### Run All Migrations

Imports categories first, then businesses (recommended order):

```bash
npm run migrate:data
```

### Run Specific Migration

```bash
# Migrate only categories
npm run migrate:data:category

# Migrate only businesses
npm run migrate:data:business
```

### Dry Run Mode

Test the migration without writing to PostgreSQL:

```bash
DRY_RUN=true npm run migrate:data
```

This will:
- Connect to both databases
- Read from MySQL
- Map and validate data
- **NOT** write to PostgreSQL
- Report what would be imported

### Custom Commands

You can also run migrations programmatically:

```bash
# Run with Node directly
node -r ts-node/register -r tsconfig-paths/register \
  src/app/infra/workers/cli/migrate-data.command.ts category business

# Run specific worker with dry run
DRY_RUN=true ts-node -r tsconfig-paths/register \
  src/app/infra/workers/cli/migrate-data.command.ts business
```

## Migration Process

### 1. Category Migration

**Execution Order**: Run first (businesses reference categories)

**Features**:
- Reads categories from MySQL `categories` table
- Maps to PostgreSQL `categories` table
- Handles duplicate detection by name
- Skips already imported categories
- Preserves original timestamps

**Fields Mapped**:
- `name` → `name` (converted to JSONB format)
- `description` → `details` (JSONB)
- `icon_url` → `remoteIconUrl`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

### 2. Business Migration

**Execution Order**: Run after categories

**Features**:
- Batch processing (100 records at a time)
- Duplicate detection by company name + phone
- Data sanitization (phone, email, coordinates)
- Default values for required fields
- Progress reporting

**Fields Mapped**:
- `company_name` → `title`
- `description` → `description`
- `latitude` → `locationLat`
- `longitude` → `locationLong`
- `phone_number` → `phoneNumber` (sanitized)
- `email` → `email` (validated)
- `address` → `address` and `locationPretty`
- `category_id` → `categoryId`
- `account_id` → `accountId`
- `is_verified` → `isVerified`
- `views` → `views`

## Output Example

```
═══════════════════════════════════════════════════════════
🔄 Circuito BR-116 - Data Migration Tool
   MySQL → PostgreSQL
═══════════════════════════════════════════════════════════

───────────────────────────────────────────────────────────
🚀 Starting: Category Migration
───────────────────────────────────────────────────────────
📊 Found 25 categories to migrate
📦 Processing batch 1/1 (25 items)
📈 Progress: 25/25 (100.0%)

✅ Category Migration completed:
   ✓ Imported: 20
   ⊘ Skipped:  5
   ✗ Failed:   0
   ⏱ Duration: 2.34s

───────────────────────────────────────────────────────────
🚀 Starting: Business Migration
───────────────────────────────────────────────────────────
📊 Found 1,523 businesses to migrate
📦 Processing batch 1/16 (100 items)
📈 Progress: 100/1523 (6.6%)
...
📦 Processing batch 16/16 (23 items)
📈 Progress: 1523/1523 (100.0%)

✅ Business Migration completed:
   ✓ Imported: 1,450
   ⊘ Skipped:  58
   ✗ Failed:   15
   ⏱ Duration: 45.67s

═══════════════════════════════════════════════════════════
📊 MIGRATION SUMMARY
═══════════════════════════════════════════════════════════
   Total Imported: 1,470
   Total Skipped:  63
   Total Failed:   15
   Total Duration: 48.01s

⚠️  ERRORS ENCOUNTERED:
   1. Failed to import Business X: Invalid phone number format
   2. Failed to import Business Y: Missing required category
   ...

═══════════════════════════════════════════════════════════
```

## Data Validation & Sanitization

### Phone Numbers
- Removes all non-numeric characters
- Requires minimum 10 digits
- Invalid numbers → `undefined`

### Email Addresses
- Trimmed and lowercased
- Must contain `@` symbol
- Invalid emails → `undefined`

### Coordinates
- Converts to numbers with fallback to 0
- Handles null/undefined values

### Strings
- Trimmed whitespace
- Empty strings converted to `undefined`
- Maximum lengths enforced

## Error Handling

The migration system handles errors gracefully:

1. **Connection Errors**: Fails fast if unable to connect to MySQL
2. **Validation Errors**: Logs error and continues with next record
3. **Duplicate Handling**: Skips existing records (no overwrite)
4. **Batch Processing**: Continues even if individual records fail
5. **Transaction Safety**: Each record is saved independently

## Extending the System

### Adding a New Migration Worker

1. **Create Legacy Entity** (`legacy-models/`):
```typescript
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('your_table')
export class LegacyYourEntity {
  @PrimaryColumn()
  id: number;
  
  @Column()
  name: string;
  // ... other fields
}
```

2. **Create Mapper** (`mappers/`):
```typescript
@Injectable()
export class YourMigrationMapper {
  mapToEntity(legacy: LegacyYourEntity): any {
    return {
      name: legacy.name,
      // ... map fields
    };
  }
  
  generateUniqueKey(legacy: LegacyYourEntity): string {
    return legacy.name.toLowerCase();
  }
}
```

3. **Create Worker**:
```typescript
@Injectable()
export class YourMigrationWorker implements IDataMigrationWorker {
  constructor(
    @InjectRepository(LegacyYourEntity, 'mysql_legacy')
    private readonly legacyRepo: Repository<LegacyYourEntity>,
    
    @InjectRepository(YourEntity)
    private readonly repo: Repository<YourEntity>,
    
    private readonly mapper: YourMigrationMapper,
  ) {}
  
  getName(): string {
    return 'Your Migration';
  }
  
  async run(): Promise<DataMigrationResult> {
    // Implement migration logic
  }
}
```

4. **Register in `workers.module.ts`**:
```typescript
imports: [
  TypeOrmModule.forFeature([YourEntity]),
  TypeOrmModule.forFeature([LegacyYourEntity], 'mysql_legacy'),
],
providers: [
  YourMigrationMapper,
  YourMigrationWorker,
],
```

5. **Add to CLI** (`cli/migrate-data.command.ts`):
```typescript
const availableWorkers = {
  your: app.get(YourMigrationWorker),
  // ... other workers
};
```

## Best Practices

1. **Always run dry-run first**: `DRY_RUN=true npm run migrate:data`
2. **Backup PostgreSQL before migration**: Use `pg_dump`
3. **Run in order**: Categories → Businesses (respect dependencies)
4. **Monitor logs**: Watch for validation errors
5. **Test with subset**: Modify `BATCH_SIZE` for testing
6. **Use read-only MySQL user**: Prevent accidental writes to legacy DB

## Troubleshooting

### Connection Refused (MySQL)
- Verify `MYSQL_HOST`, `MYSQL_PORT` in `.env`
- Check firewall rules
- Ensure MySQL user has proper permissions

### Duplicate Key Errors (PostgreSQL)
- Run migration will skip existing records
- Check unique constraints on target tables
- Clear PostgreSQL table if starting fresh

### Memory Issues (Large Datasets)
- Reduce `BATCH_SIZE` in worker files
- Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096`

### Slow Performance
- Enable MySQL logging: `MYSQL_LOGGING=true`
- Check database indexes
- Monitor network latency between MySQL and PostgreSQL

## Security Notes

⚠️ **Important Security Considerations**:

- Use **read-only** MySQL credentials
- Never commit `.env` file with real credentials
- Use SSH tunnel for remote MySQL connections
- Audit migrated data before going to production
- Set `synchronize: false` in MySQL connection (already configured)

## License

This migration system is part of the Circuito BR-116 backend application.
