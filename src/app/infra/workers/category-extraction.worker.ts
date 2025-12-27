import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IDataMigrationWorker,
  DataMigrationResult,
} from '../interfaces/data-migration.interface.worker';
import { LegacyBusiness } from '../legacy-models/legacy-business.entity';
import { Category } from '../../repositories/type-orm/models/category.entity';

/**
 * Worker to extract unique categories from cadastro.palavrachave
 * and create them in PostgreSQL
 */
@Injectable()
export class CategoryExtractionWorker implements IDataMigrationWorker {
  private readonly logger = new Logger(CategoryExtractionWorker.name);
  private readonly isDryRun = process.env.DRY_RUN === 'true';

  constructor(
    @InjectRepository(LegacyBusiness, 'mysql_legacy')
    private readonly legacyRepo: Repository<LegacyBusiness>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  getName(): string {
    return 'Category Extraction from palavrachave';
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

    this.logger.log('🚀 Extracting unique categories from cadastro.palavrachave...');

    try {
      // Get all unique palavrachave values
      const uniqueKeywords = await this.legacyRepo
        .createQueryBuilder('cadastro')
        .select('DISTINCT cadastro.palavrachave', 'palavrachave')
        .where('cadastro.palavrachave IS NOT NULL')
        .andWhere("cadastro.palavrachave != ''")
        .getRawMany();

      this.logger.log(`📊 Found ${uniqueKeywords.length} unique keywords`);

      const processedNames = new Set<string>();

      for (const row of uniqueKeywords) {
        const palavrachave = row.palavrachave as string;
        
        if (!palavrachave || !palavrachave.trim()) {
          continue;
        }

        try {
          // Normalize keyword: replace underscores with spaces
          const categoryName = this.normalizeCategoryName(palavrachave);
          
          // Skip if already processed
          if (processedNames.has(categoryName.toLowerCase())) {
            result.skipped++;
            continue;
          }

          // Check if category already exists
          const existing = await this.categoryRepo
            .createQueryBuilder('category')
            .where("category.name->>'pt' = :name", { name: categoryName })
            .getOne();

          if (existing) {
            this.logger.debug(`⏭️  Category already exists: ${categoryName}`);
            result.skipped++;
            processedNames.add(categoryName.toLowerCase());
            continue;
          }

          // Create new category
          const category = this.categoryRepo.create({
            name: {
              pt: categoryName,
              en: this.translateToEnglish(categoryName),
              es: this.translateToSpanish(categoryName),
            },
            details: {
              pt: `Categoria importada: ${categoryName}`,
              en: `Imported category: ${categoryName}`,
              es: `Categoría importada: ${categoryName}`,
            },
            icon: this.suggestIcon(categoryName),
            remoteIconUrl: null,
            vector: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          if (!this.isDryRun) {
            await this.categoryRepo.save(category);
          }

          result.imported++;
          processedNames.add(categoryName.toLowerCase());

          this.logger.debug(`✅ ${this.isDryRun ? '[DRY RUN] ' : ''}Created category: ${categoryName}`);
        } catch (error) {
          result.failed++;
          const errorMsg = `Failed to create category from "${palavrachave}": ${error.message}`;
          result.errors.push(errorMsg);
          this.logger.error(`❌ ${errorMsg}`);
        }
      }

      result.durationMs = Date.now() - startTime;

      this.logger.log(
        `✅ Category extraction completed in ${(result.durationMs / 1000).toFixed(2)}s: ` +
        `${result.imported} imported, ${result.skipped} skipped, ${result.failed} failed`,
      );
    } catch (error) {
      this.logger.error(
        `💥 Fatal error during category extraction: ${error.message}`,
        error.stack,
      );
      result.durationMs = Date.now() - startTime;
      throw error;
    }

    return result;
  }

  /**
   * Normalize category name from palavrachave
   * Replace underscores with spaces and capitalize properly
   */
  private normalizeCategoryName(palavrachave: string): string {
    return palavrachave
      .trim()
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Basic translation to English (extend as needed)
   */
  private translateToEnglish(categoryName: string): string {
    const translations: { [key: string]: string } = {
      'Restaurante': 'Restaurant',
      'Hotel': 'Hotel',
      'Pousada': 'Inn',
      'Posto': 'Gas Station',
      'Mercado': 'Market',
      'Materiais Para Construções': 'Construction Materials',
      'Construção': 'Construction',
      'Farmácia': 'Pharmacy',
      // Add more as needed
    };

    return translations[categoryName] || categoryName;
  }

  /**
   * Basic translation to Spanish (extend as needed)
   */
  private translateToSpanish(categoryName: string): string {
    const translations: { [key: string]: string } = {
      'Restaurante': 'Restaurante',
      'Hotel': 'Hotel',
      'Pousada': 'Posada',
      'Posto': 'Gasolinera',
      'Mercado': 'Mercado',
      'Materiais Para Construções': 'Materiales de Construcción',
      'Construção': 'Construcción',
      'Farmácia': 'Farmacia',
      // Add more as needed
    };

    return translations[categoryName] || categoryName;
  }

  /**
   * Suggest an icon based on category name
   */
  private suggestIcon(categoryName: string): string {
    const lower = categoryName.toLowerCase();
    
    if (lower.includes('restaurante') || lower.includes('lanchonete')) return 'restaurant';
    if (lower.includes('hotel') || lower.includes('pousada')) return 'hotel';
    if (lower.includes('posto') || lower.includes('combustível')) return 'local_gas_station';
    if (lower.includes('mercado') || lower.includes('supermercado')) return 'shopping_cart';
    if (lower.includes('construção') || lower.includes('materiais')) return 'construction';
    if (lower.includes('farmácia') || lower.includes('drogaria')) return 'local_pharmacy';
    if (lower.includes('mecânica') || lower.includes('oficina')) return 'build';
    if (lower.includes('camping')) return 'terrain';
    
    return 'place'; // Default icon
  }
}
