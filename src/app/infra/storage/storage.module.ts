import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IStorageService } from './interfaces/storage.interface.service';
import { AWSStorageService } from './aws/aws-storage.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: IStorageService,
      useClass: AWSStorageService,
    },
  ],
  exports: [IStorageService],
})
export class StorageModule {}
