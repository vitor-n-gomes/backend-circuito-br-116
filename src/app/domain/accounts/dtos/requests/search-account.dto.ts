import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class SearchAccountDto {
  @ApiProperty({ description: 'Search keyword', example: 'john' })
  @IsString()
  keyword: string;

  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Items per page', example: 5, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  perPage?: number;
}
