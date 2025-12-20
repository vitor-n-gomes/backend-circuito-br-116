import { ApiProperty } from '@nestjs/swagger';

export class LastSeenBusinessResponseDto {
  @ApiProperty({ description: 'Last seen UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Last seen ID (auto-increment)', example: 1 })
  aux_id: number;

  @ApiProperty({ description: 'Account ID' })
  accountId: number;

  @ApiProperty({ description: 'Business UUID' })
  businessId: string;

  @ApiProperty({ description: 'Last seen timestamp' })
  lastSeenAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
