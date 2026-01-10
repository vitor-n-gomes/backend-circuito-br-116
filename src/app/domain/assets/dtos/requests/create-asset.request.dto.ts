import { IsNotEmpty, IsString, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({ description: 'File path/URL', example: 'uploads/image123.jpg' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ description: 'File size in bytes', example: 1024000 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  size: number;

  @ApiProperty({ description: 'Original filename', required: false })
  @IsString()
  @IsOptional()
  initialName?: string;

  @ApiProperty({ description: 'MIME type of the file', example: 'image/jpeg', required: false })
  @IsString()
  @IsOptional()
  mimetype?: string;

  @ApiProperty({ description: 'Storage key/path', example: 'business-logos/uuid-filename.jpg', required: false })
  @IsString()
  @IsOptional()
  storageKey?: string;

  @ApiProperty({ description: 'Storage URL', example: 'https://s3.amazonaws.com/bucket/path/file.jpg', required: false })
  @IsString()
  @IsOptional()
  storageUrl?: string;
}
