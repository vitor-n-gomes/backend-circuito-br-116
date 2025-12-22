import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsObject, IsNumber, IsArray } from 'class-validator';

export class UpdateAccountDto {
  @ApiProperty({ description: 'Account name', example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Location description', example: 'São Paulo, SP', required: false })
  @IsString()
  @IsOptional()
  locationPretty?: string;

  @ApiProperty({ description: 'Accepted terms and conditions', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  acceptedTermsAndCondition?: boolean;

  @ApiProperty({ description: 'Intro completed flag', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  introDone?: boolean;

  @ApiProperty({ description: 'Intro skipped flag', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  introSkipped?: boolean;

  @ApiProperty({ description: 'Profile picture URL', example: 'https://example.com/picture.png', required: false })
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiProperty({ description: 'Device FCM token', required: false })
  @IsString()
  @IsOptional()
  deviceFCMToken?: string;

  @ApiProperty({ description: 'Selected currency ID', required: false })
  @IsString()
  @IsOptional()
  selectedCurrencyId?: string;

  @ApiProperty({ description: 'Categories setup completed', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  categoriesSetupDone?: boolean;

  @ApiProperty({ description: 'Account metadata', example: {}, required: false })
  @IsObject()
  @IsOptional()
  meta?: Record<string, unknown>;

  @ApiProperty({ description: 'Allowed notification types', example: { NEW_BID_ON_AUCTION: true }, required: false })
  @IsObject()
  @IsOptional()
  allowedNotifications?: Record<string, boolean>;

  @ApiProperty({ description: 'Preferred category IDs', example: [], type: [String], required: false })
  @IsArray()
  @IsOptional()
  preferredCategoriesIds?: string[];

  @ApiProperty({ description: 'Location latitude', example: -23.5505, required: false })
  @IsNumber()
  @IsOptional()
  locationLat?: number;

  @ApiProperty({ description: 'Location longitude (JSON)', example: -46.6333, required: false })
  @IsOptional()
  locationLong?: any;
}
