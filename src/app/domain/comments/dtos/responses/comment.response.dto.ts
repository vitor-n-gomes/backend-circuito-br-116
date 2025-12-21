import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty({ description: 'Comment UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Comment ID (auto-increment)', example: 1 })
  aux_id: number;

  @ApiProperty({ description: 'Account UUID who created the comment' })
  accountId: string;

  @ApiProperty({ description: 'Auction UUID (if comment is on auction)', required: false })
  auctionId: string;

  @ApiProperty({ description: 'Business UUID (if comment is on business)', required: false })
  businessId: string;

  @ApiProperty({ description: 'Comment content/text' })
  content: string;

  @ApiProperty({ description: 'Parent comment UUID (for replies)', required: false })
  parentCommentId: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Reply comments', type: () => [CommentResponseDto], required: false })
  replies?: CommentResponseDto[];
}
