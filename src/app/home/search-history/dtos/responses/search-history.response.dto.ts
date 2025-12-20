import { ApiProperty } from '@nestjs/swagger';

export class SearchHistoryResponseDto {
  @ApiProperty({ description: 'Search history UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Account UUID' })
  accountId: string;

  @ApiProperty({ description: 'Search key/query', example: 'restaurant' })
  searchKey: string;

  @ApiProperty({ description: 'Search type', example: 'business' })
  type: string;

  @ApiProperty({ description: 'Related entity UUID', required: false })
  entityId: string;

  @ApiProperty({ description: 'Additional data as JSON string', required: false })
  data: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
