import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ description: 'Category ID (auto-increment)', example: 1 })
  aux_id: number;

  @ApiProperty({ description: 'Category UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Parent category UUID', required: false })
  parentCategoryId: string;

  @ApiProperty({ description: 'Category name in multiple languages', example: { en: 'Electronics', pt: 'Eletrônicos' } })
  name: Record<string, string>;

  @ApiProperty({ description: 'Category details', required: false })
  details: Record<string, string>;

  @ApiProperty({ description: 'Icon name/path', required: false })
  icon: string;

  @ApiProperty({ description: 'Asset ID for category image', required: false })
  assetId: string;

  @ApiProperty({ description: 'Remote icon URL', required: false })
  remoteIconUrl: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Subcategories', type: () => [CategoryResponseDto], required: false })
  subcategories?: CategoryResponseDto[];

  @ApiProperty({ description: 'Business count in this category', required: false })
  businessCount?: number;
}
