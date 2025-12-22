import { IsOptional, IsString, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FilterBusinessDto {
  @ApiProperty({ description: 'Search query', required: false })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiProperty({ description: 'Category IDs to filter by', type: [Number], required: false })
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  categories?: number[];

  @ApiProperty({ description: 'Location IDs to filter by', type: [Number], required: false })
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  locationIds?: number[];

  @ApiProperty({ description: 'Classification codes to filter by', type: [String], required: false })
  @IsArray()
  @IsOptional()
  classifications?: string[];

  @ApiProperty({ description: 'Filter only promoted businesses', required: false })
  @IsBoolean()
  @IsOptional()
  promotedOnly?: boolean;

  @ApiProperty({ description: 'Filter only verified businesses', required: false })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiProperty({ description: 'Minimum view count', required: false })
  @IsNumber()
  @IsOptional()
  minViews?: number;

  @ApiProperty({ description: 'Maximum view count', required: false })
  @IsNumber()
  @IsOptional()
  maxViews?: number;

  @ApiProperty({ description: 'Account ID to filter by', required: false })
  @IsNumber()
  @IsOptional()
  accountId?: number;
}
