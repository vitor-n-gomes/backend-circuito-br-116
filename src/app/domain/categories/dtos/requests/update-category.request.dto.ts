import { IsOptional, IsObject, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Category name in multiple languages', example: { en: 'Electronics', pt: 'Eletrônicos' }, required: false })
  @IsObject()
  @IsOptional()
  name?: Record<string, string>;

  @ApiProperty({ description: 'Parent category UUID', required: false })
  @IsUUID()
  @IsOptional()
  parentCategoryId?: string;

  @ApiProperty({ description: 'Category details', required: false })
  @IsObject()
  @IsOptional()
  details?: Record<string, string>;

  @ApiProperty({ description: 'Icon name/path', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: 'Asset ID for category image', required: false })
  @IsUUID()
  @IsOptional()
  assetId?: string;

  @ApiProperty({ description: 'Remote icon URL', required: false })
  @IsString()
  @IsOptional()
  remoteIconUrl?: string;
}
