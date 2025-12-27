/**
 * Result of a data migration operation
 */
export interface DataMigrationResult {
  /**
   * Number of records successfully imported
   */
  imported: number;

  /**
   * Number of records that failed to import
   */
  failed: number;

  /**
   * Number of records skipped (duplicates, etc.)
   */
  skipped: number;

  /**
   * List of error messages
   */
  errors: string[];

  /**
   * Duration in milliseconds
   */
  durationMs: number;
}

/**
 * Abstract interface for data migration workers
 */
export abstract class IDataMigrationWorker {
  /**
   * Execute the migration
   */
  abstract run(): Promise<DataMigrationResult>;

  /**
   * Get migration name
   */
  abstract getName(): string;
}
