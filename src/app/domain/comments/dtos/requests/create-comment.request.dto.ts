import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content/text', example: 'Great business!' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Auction UUID (if commenting on auction)', required: false })
  @IsUUID()
  @IsOptional()
  auctionId?: string;

  @ApiProperty({ description: 'Business UUID (if commenting on business)', required: false })
  @IsUUID()
  @IsOptional()
  businessId?: string;

  @ApiProperty({ description: 'Parent comment UUID (for replies)', required: false })
  @IsUUID()
  @IsOptional()
  parentCommentId?: string;
}
