import { ApiProperty } from '@nestjs/swagger';

export class LocationResponseDto {
  @ApiProperty({ description: 'Location ID (auto-increment)', example: 1 })
  aux_id: number;

  @ApiProperty({ description: 'Location UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Location name', example: 'São Paulo, SP' })
  name: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Count of businesses in this location', required: false })
  businessCount?: number;
}
