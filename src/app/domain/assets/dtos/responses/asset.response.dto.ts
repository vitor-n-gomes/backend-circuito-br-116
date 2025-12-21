import { ApiProperty } from '@nestjs/swagger';

export class AssetResponseDto {
  @ApiProperty({ description: 'Asset UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Asset ID (auto-increment)', example: 1 })
  aux_id: number;

  @ApiProperty({ description: 'File path/URL', example: 'uploads/image123.jpg' })
  path: string;

  @ApiProperty({ description: 'File size in bytes', example: 1024000 })
  size: number;

  @ApiProperty({ description: 'Original filename', required: false })
  initialName: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
