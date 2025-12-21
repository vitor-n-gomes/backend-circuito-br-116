import { IsNotEmpty, IsString, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({ description: 'File path/URL', example: 'uploads/image123.jpg' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ description: 'File size in bytes', example: 1024000 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  size: number;

  @ApiProperty({ description: 'Original filename', required: false })
  @IsString()
  @IsOptional()
  initialName?: string;
}
