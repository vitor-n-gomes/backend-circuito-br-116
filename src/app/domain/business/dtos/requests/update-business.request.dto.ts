import { IsOptional, IsString, IsNumber, IsEmail, IsBoolean, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBusinessDto {
  @ApiProperty({ description: 'Business title', example: 'Amazing Restaurant', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(180)
  title?: string;

  @ApiProperty({ description: 'Business description', example: 'The best food in town', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Location name', example: 'São Paulo, SP', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  locationPretty?: string;

  @ApiProperty({ description: 'Latitude coordinate', example: -23.5505, required: false })
  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  locationLat?: number;

  @ApiProperty({ description: 'Longitude coordinate', example: -46.6333, required: false })
  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  locationLong?: number;

  @ApiProperty({ description: 'Category ID', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  categoryId?: number

  @ApiProperty({ description: 'Classification code', example: 'A1', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(2)
  classification?: string;

  @ApiProperty({ description: 'Phone number', example: '+5511999999999', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiProperty({ description: 'Email address', example: 'contact@business.com', required: false })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiProperty({ description: 'Physical address', example: 'Rua Example, 123', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @ApiProperty({ description: 'WhatsApp number', example: '+5511999999999', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  whatsapp?: string;

  @ApiProperty({ description: 'Facebook profile URL', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  facebook?: string;

  @ApiProperty({ description: 'Instagram handle', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  instagram?: string;

  @ApiProperty({ description: 'TikTok handle', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  tiktok?: string;

  @ApiProperty({ description: 'Verification status', required: false })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiProperty({ description: 'View count', required: false })
  @IsNumber()
  @IsOptional()
  views?: number;
}
