import { ApiProperty } from '@nestjs/swagger';

export class BusinessResponseDto {
  @ApiProperty({ description: 'Business ID', example: 1 })
  aux_id: number;

  @ApiProperty({ description: 'Business UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Account ID', example: 1 })
  accountId: number;

  @ApiProperty({ description: 'Location ID', example: 1 })
  locationId: number;

  @ApiProperty({ description: 'Location name', example: 'São Paulo, SP' })
  locationPretty: string;

  @ApiProperty({ description: 'Latitude coordinate', example: -23.5505 })
  locationLat: number;

  @ApiProperty({ description: 'Longitude coordinate', example: -46.6333 })
  locationLong: number;

  @ApiProperty({ description: 'Business title', example: 'Amazing Restaurant' })
  title: string;

  @ApiProperty({ description: 'Business description', example: 'The best food in town' })
  description: string;

  @ApiProperty({ description: 'View count', example: 150 })
  views: number;

  @ApiProperty({ description: 'Verification status', example: false })
  isVerified: boolean;

  @ApiProperty({ description: 'Phone number', example: '+5511999999999', required: false })
  phoneNumber: string;

  @ApiProperty({ description: 'Email address', example: 'contact@business.com', required: false })
  email: string;

  @ApiProperty({ description: 'Physical address', example: 'Rua Example, 123', required: false })
  address: string;

  @ApiProperty({ description: 'Promotion date', required: false })
  promotedAt: Date;

  @ApiProperty({ description: 'WhatsApp number', example: '+5511999999999', required: false })
  whatsapp: string;

  @ApiProperty({ description: 'Facebook profile URL', required: false })
  facebook: string;

  @ApiProperty({ description: 'Instagram handle', required: false })
  instagram: string;

  @ApiProperty({ description: 'TikTok handle', required: false })
  tiktok: string;

  @ApiProperty({ description: 'Category ID', example: 1 })
  category_id: number;

  @ApiProperty({ description: 'Classification code', example: 'A1' })
  classification: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
