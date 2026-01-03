import { Injectable, Logger, Inject } from '@nestjs/common';
import { IBusinessRepository } from '../repositories/interfaces/business.interface.repository';
import { IAssetRepository } from '../repositories/interfaces/asset.interface.repository';
import { IStorageService, ExpressFile } from '../storage/interfaces/storage.interface.service';
import {
  IDataMigrationWorker,
  DataMigrationResult,
} from './interfaces/data-migration.interface.worker';
import axios from 'axios';
import { extname } from 'path';

/**
 * Worker to migrate business photos from legacy URLs to AWS S3 and PostgreSQL
 * IMPORTANT: Run after BusinessMigrationWorker
 */
@Injectable()
export class PhotoMigrationWorker implements IDataMigrationWorker {
  private readonly logger = new Logger(PhotoMigrationWorker.name);
  private readonly isDryRun = process.env.DRY_RUN === 'true';
  private readonly BATCH_SIZE = 50;

  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: IBusinessRepository,
    @Inject(IAssetRepository)
    private readonly assetRepository: IAssetRepository,
    @Inject(IStorageService)
    private readonly storageService: IStorageService,
  ) {}

  getName(): string {
    return 'Photo Migration from oldFields.originalPhoto';
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
      this.logger.warn('🔍 DRY RUN MODE - No files will be uploaded or saved');
    }

    this.logger.log('🚀 Starting photo migration from legacy oldFields...');

    try {
      const businessesWithPhotos = await this.getBusinessesWithPhotos();
      this.logger.log(`📸 Found ${businessesWithPhotos.length} businesses with photos`);

      // Process in batches
      for (let i = 0; i < businessesWithPhotos.length; i += this.BATCH_SIZE) {
        const batch = businessesWithPhotos.slice(i, i + this.BATCH_SIZE);
        
        for (let j = 0; j < batch.length; j++) {
          const business = batch[j];
          const globalIndex = i + j + 1;
          
          try {
            const photoUrl = business.oldFields?.originalPhoto;
            
            if (!this.isValidPhotoUrl(photoUrl)) {
              this.logger.debug(`⚠️  Invalid photo URL for business ${business.title}: ${photoUrl}`);
              result.skipped++;
              continue;
            }

            // Check if business already has assets (to avoid duplicates)
            const existingAssets = await this.getBusinessAssets(business.auxId);
            
            if (existingAssets && existingAssets.length > 0) {
              this.logger.debug(`⏭️  Assets already exist for business ${business.title}`);
              result.skipped++;
              continue;
            }

            await this.processBusinessPhoto(business, photoUrl);
            result.imported++;
            
            this.logger.log(`✅ [${globalIndex}/${businessesWithPhotos.length}] Successfully processed: ${business.title}`);
            
          } catch (error) {
            result.failed++;
            const errorMsg = `Failed to process photo for ${business.title}: ${error.message}`;
            result.errors.push(errorMsg);
            this.logger.error(`❌ [${globalIndex}/${businessesWithPhotos.length}] ${errorMsg}`);
            
            // Continue with next business
            continue;
          }
        }

        // Rate limiting between batches
        if (i + this.BATCH_SIZE < businessesWithPhotos.length) {
          this.logger.debug(`💤 Rate limiting pause after batch ${Math.ceil((i + this.BATCH_SIZE) / this.BATCH_SIZE)}...`);
          await this.delay(2000);
        }
      }

      result.durationMs = Date.now() - startTime;

      this.logger.log(
        `✅ Photo migration completed in ${(result.durationMs / 1000).toFixed(2)}s: ` +
        `${result.imported} imported, ${result.skipped} skipped, ${result.failed} failed`,
      );

    } catch (error) {
      this.logger.error(
        `💥 Fatal error during photo migration: ${error.message}`,
        error.stack,
      );
      result.durationMs = Date.now() - startTime;
      throw error;
    }

    return result;
  }

  private async getBusinessesWithPhotos() {
    return this.businessRepository.findBusinessesWithValidPhoto();
  }

  private async getBusinessAssets(businessId: number): Promise<any[] | null> {
    try {
      // This would need to be implemented in the repository
      // For now, we'll assume no duplicates and let the database handle it
      return null;
    } catch (error) {
      this.logger.debug(`Could not check existing assets for business ${businessId}: ${error.message}`);
      return null;
    }
  }

  private isValidPhotoUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    const trimmed = url.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === 'N/A') return false;
    
    // Check if it's a valid URL format
    try {
      new URL(trimmed);
      return this.isImageUrl(trimmed);
    } catch {
      // Check if it's a relative path
      return this.isImagePath(trimmed);
    }
  }

  private isImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const urlWithoutQuery = url.split('?')[0].toLowerCase();
    return imageExtensions.some(ext => urlWithoutQuery.includes(ext));
  }

  private isImagePath(path: string): boolean {
    return path.startsWith('/') || this.isImageUrl(path);
  }

  private async processBusinessPhoto(business: any, photoUrl: string): Promise<void> {
    if (this.isDryRun) {
      this.logger.debug(`[DRY RUN] Would process photo: ${photoUrl} for ${business.title}`);
      return;
    }

    try {
      // Download photo
      const photoBuffer = await this.downloadPhoto(photoUrl);
      
      // Validate file size (max 10MB)
      if (photoBuffer.length > 10 * 1024 * 1024) {
        throw new Error(`File too large: ${(photoBuffer.length / 1024 / 1024).toFixed(2)}MB`);
      }

      // Validate minimum file size (at least 100 bytes)
      if (photoBuffer.length < 100) {
        throw new Error(`File too small: ${photoBuffer.length} bytes`);
      }

      // Create file object for storage service
      const file: ExpressFile = {
        buffer: photoBuffer,
        mimetype: this.getMimeType(this.extractExtension(photoUrl)),
        originalname: this.extractOriginalFilename(photoUrl),
        size: photoBuffer.length,
        fieldname: 'photo',
        encoding: '7bit',
        // filename is optional and will be set by storage service
      };

      // Upload to storage using existing service
      const uploadedFile = await this.storageService.upload(file);
      
      if (!uploadedFile || !uploadedFile.filename) {
        throw new Error('Failed to upload file to storage - no filename returned');
      }

      // Create asset record with new field names
      const asset = await this.assetRepository.create({
        path: uploadedFile.filename,
        size: uploadedFile.size,
        initialName: uploadedFile.originalname,
        mimetype: file.mimetype,
        storageKey: uploadedFile.filename, // Using the uploaded filename as storage key
        storageUrl: uploadedFile.filename, // This might need adjustment based on your storage service response
      });

      // Create business-asset relationship using raw query
      // This is a temporary solution until BusinessAssetRepository is implemented
      // await this.createBusinessAssetRelation(business.auxId, asset.id);

      this.logger.debug(`✅ Created asset ${asset.id} for business ${business.auxId} (${business.title})`);

    } catch (error) {
      this.logger.error(`❌ Error processing photo for business ${business.title}:`, error.message);
      throw error;
    }
  }

  private async downloadPhoto(photoUrl: string): Promise<Buffer> {
    try {
      const fullUrl = this.constructFullUrl(photoUrl);
      
      this.logger.debug(`📥 Downloading: ${fullUrl}`);
      
      const response = await axios.get(fullUrl, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 seconds
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CircuitoBR116Bot/1.0; +https://circuitobr116.com.br)',
          'Accept': 'image/*,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
        },
        validateStatus: (status) => status >= 200 && status < 400,
      });

      if (!response.data || response.data.byteLength === 0) {
        throw new Error('Empty response received');
      }

      // Validate content type if available
      const contentType = response.headers['content-type'];
      if (contentType && !contentType.startsWith('image/') && !contentType.includes('octet-stream')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      return Buffer.from(response.data);
      
    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error(`Photo URL not accessible: ${photoUrl}`);
      }
      if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
        throw new Error(`Photo download timeout: ${photoUrl}`);
      }
      if (error.response?.status === 404) {
        throw new Error(`Photo not found (404): ${photoUrl}`);
      }
      if (error.response?.status === 403) {
        throw new Error(`Photo access forbidden (403): ${photoUrl}`);
      }
      if (error.response?.status === 500) {
        throw new Error(`Server error (500): ${photoUrl}`);
      }
      
      throw new Error(`Failed to download photo from ${photoUrl}: ${error.message}`);
    }
  }

  private constructFullUrl(photoUrl: string): string {
    if (photoUrl.startsWith('http')) {
      return photoUrl;
    }
    
    // Construct full URL for relative paths from legacy system
    // Legacy photos are stored at: https://circuitobr116.com.br/sistema/files/
    const baseUrl = 'https://circuitobr116.com.br/sistema/files';
    
    // Remove leading slash if present and construct URL
    const cleanPath = photoUrl.startsWith('/') ? photoUrl.substring(1) : photoUrl;
    return `${baseUrl}/${cleanPath}`;
  }

  private extractExtension(photoUrl: string): string {
    const ext = extname(photoUrl.split('?')[0]);
    return ext || '.jpg'; // Default to .jpg if no extension found
  }

  private extractOriginalFilename(photoUrl: string): string {
    const filename = photoUrl.split('/').pop()?.split('?')[0];
    return filename || 'legacy-photo';
  }

  private getMimeType(extension: string): string {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp',
      '.svg': 'image/svg+xml',
    };
    return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}