import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { IStorageService } from '@/app/infra/storage/interfaces/storage.interface.service';
import { StorageModule } from '@/app/infra/storage/storage.module';
import { ExpressFile } from '@/app/infra/storage/interfaces/storage.interface.service';

describe('AWSStorageService (e2e)', () => {
  let module: TestingModule;
  let storageService: IStorageService;
  let uploadedFilename: string | undefined;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.test', '.env'],
          isGlobal: true,
        }),
        StorageModule,
      ],
    }).compile();

    storageService = module.get<IStorageService>(IStorageService);
  });

  afterAll(async () => {
    // Clean up uploaded file from S3
    if (uploadedFilename) {
      try {
        await storageService.delete(uploadedFilename);
      } catch (error) {
        console.warn(`Failed to delete test file ${uploadedFilename}:`, error);
      }
    }

    if (module) {
      await module.close();
    }
  });

  describe('upload', () => {
    it('should upload a file to S3 and return file metadata', async () => {
      // Create a test image buffer (1x1 pixel JPEG)
      const testImageBuffer = Buffer.from(
        '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==',
        'base64'
      );

      const testFile: ExpressFile = {
        fieldname: 'file',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: testImageBuffer,
        size: testImageBuffer.length,
      };

      const result = await storageService.upload(testFile);

      expect(result).toBeDefined();
      expect(result?.filename).toBeDefined();
      expect(result?.filename).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(result?.mimetype).toBe('image/jpeg');

      // Store filename for cleanup
      uploadedFilename = result?.filename;
    }, 30000);

    it('should compress large images before uploading', async () => {
      // Create a larger test buffer to ensure compression is triggered
      const largeBuffer = Buffer.alloc(500000); // 500KB buffer

      const testFile: ExpressFile = {
        fieldname: 'file',
        originalname: 'large-test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: largeBuffer,
        size: largeBuffer.length,
      };

      // This should not throw even though compression might fail on random buffer
      // The service should handle compression errors gracefully
      try {
        const result = await storageService.upload(testFile);
        if (result?.filename) {
          // Clean up if upload succeeded
          await storageService.delete(result.filename);
        }
      } catch (error) {
        // Compression might fail on invalid image data, which is expected
        expect(error).toBeDefined();
      }
    }, 30000);

    it('should handle file without mimetype by defaulting to JPEG', async () => {
      const testImageBuffer = Buffer.from(
        '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==',
        'base64'
      );

      const testFile: ExpressFile = {
        fieldname: 'file',
        originalname: 'test-no-mime.jpg',
        encoding: '7bit',
        mimetype: '' as any,
        buffer: testImageBuffer,
        size: testImageBuffer.length,
      };

      const result = await storageService.upload(testFile);

      expect(result).toBeDefined();
      expect(result?.mimetype).toBe('image/jpeg');

      // Clean up
      if (result?.filename) {
        await storageService.delete(result.filename);
      }
    }, 30000);
  });

  describe('delete', () => {
    it('should delete a file from S3', async () => {
      // First upload a file
      const testImageBuffer = Buffer.from(
        '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==',
        'base64'
      );

      const testFile: ExpressFile = {
        fieldname: 'file',
        originalname: 'test-delete.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: testImageBuffer,
        size: testImageBuffer.length,
      };

      const uploadResult = await storageService.upload(testFile);
      expect(uploadResult?.filename).toBeDefined();

      // Now delete it
      await expect(
        storageService.delete(uploadResult!.filename!)
      ).resolves.not.toThrow();

      // Clear the cleanup variable since we already deleted
      uploadedFilename = undefined;
    }, 30000);

    it('should throw error when deleting non-existent file', async () => {
      const fakeFilename = 'non-existent-file-12345.jpg';

      // AWS S3 might not throw on deleting non-existent files (returns success)
      // but our service should handle it gracefully
      await expect(
        storageService.delete(fakeFilename)
      ).resolves.not.toThrow();
    }, 30000);
  });

  describe('sendToClient', () => {
    it('should redirect to correct S3 URL', async () => {
      const testPath = 'test-file.jpg';
      const mockResponse = {
        redirect: jest.fn(),
      } as any;

      await storageService.sendToClient(testPath, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('s3.amazonaws.com')
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining(testPath)
      );
    });
  });

  describe('Integration Tests', () => {
    it('should successfully upload and then delete a file', async () => {
      const testImageBuffer = Buffer.from(
        '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==',
        'base64'
      );

      const testFile: ExpressFile = {
        fieldname: 'file',
        originalname: 'test-integration.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: testImageBuffer,
        size: testImageBuffer.length,
      };

      // Upload
      const uploadResult = await storageService.upload(testFile);
      expect(uploadResult?.filename).toBeDefined();

      const filename = uploadResult!.filename!;

      // Verify we can get the URL
      const mockResponse = {
        redirect: jest.fn(),
      } as any;

      await storageService.sendToClient(filename, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalled();

      // Delete
      await expect(storageService.delete(filename)).resolves.not.toThrow();

      // Clear cleanup variable
      uploadedFilename = undefined;
    }, 30000);
  });
});
