import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { IStorageService } from '../interfaces/storage.interface.service';
import { ExpressFile } from '../interfaces/storage.interface.service';
import { compressFile } from '../utils/compress-file.util';

@Injectable()
export class AWSStorageService implements IStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const region =
      this.configService.get<string>('AWS_STORAGE_REGION') || 'us-east-1';
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY'
    );

    this.bucketName =
      this.configService.get<string>('AWS_STORAGE_BUCKET') || '';

    this.s3Client = new S3Client({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });
  }

  async upload(file: ExpressFile): Promise<ExpressFile | undefined> {
    if (!this.s3Client) {
      throw new Error('AWS S3 client not initialized');
    }

    try {
      file.filename = uuidv4();
      file.mimetype = file.mimetype && file.mimetype.trim() !== '' 
        ? file.mimetype 
        : 'image/jpeg';

      let buffer = file.buffer;
      try {
        buffer = await compressFile(file.buffer, file.mimetype);
      } catch (error) {
        console.error(`Could not compress file: ${error}`);
      }

      const uploadParams = {
        Bucket: this.bucketName,
        Key: file.filename,
        Body: buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);

      return file;
    } catch (error) {
      console.error(`Could not upload file to AWS: ${error}`);
      throw error;
    }
  }

  async delete(path: string): Promise<void> {
    if (!this.s3Client) {
      throw new Error('AWS S3 client not initialized');
    }

    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: path,
      };

      const command = new DeleteObjectCommand(deleteParams);
      await this.s3Client.send(command);
    } catch (error) {
      console.error(`Could not delete file from AWS: ${error}`);
      throw error;
    }
  }

  async sendToClient(path: string, res: Response): Promise<void> {
    const url = `https://${this.bucketName}.s3.amazonaws.com/${path}`;
    res.redirect(url);
  }
}
