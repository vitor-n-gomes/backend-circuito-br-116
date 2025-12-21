import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsObject, IsEmail, IsNumber } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ description: 'Account name', example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Firebase Auth ID', example: 'firebase-auth-id-123' })
  @IsString()
  authId: string;

  @ApiProperty({ description: 'Account email', example: 'john@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Phone number', example: '+5511999999999', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Profile picture URL', example: 'https://example.com/picture.png', required: false })
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiProperty({ description: 'Is anonymous account', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @ApiProperty({ description: 'Identity providers', example: { google: ['google.com'] }, required: false })
  @IsObject()
  @IsOptional()
  identities?: Record<string, string[]>;

  @ApiProperty({ description: 'Selected currency ID', required: false })
  @IsString()
  @IsOptional()
  selectedCurrencyId?: string;

  @ApiProperty({ description: 'Account metadata', example: {}, required: false })
  @IsObject()
  @IsOptional()
  meta?: Record<string, unknown>;
}
