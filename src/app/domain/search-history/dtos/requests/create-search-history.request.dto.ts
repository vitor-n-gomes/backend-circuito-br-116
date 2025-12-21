import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSearchHistoryDto {
  @ApiProperty({ description: 'Search key/query', example: 'restaurant' })
  @IsString()
  @IsNotEmpty()
  searchKey: string;

  @ApiProperty({ description: 'Search type', example: 'business' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Related entity UUID', required: false })
  @IsUUID()
  @IsOptional()
  entityId?: string;

  @ApiProperty({ description: 'Additional data as JSON string', required: false })
  @IsString()
  @IsOptional()
  data?: string;
}
