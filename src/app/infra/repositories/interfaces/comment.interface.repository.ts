import { CommentResponseDto } from '../../../home/comments/dtos/responses/comment.response.dto';
import { CreateCommentDto } from '../../../home/comments/dtos/requests/create-comment.request.dto';

export abstract class ICommentRepository {
  abstract findById(id: string): Promise<CommentResponseDto | null>;
  
  abstract findByBusinessId(businessId: string): Promise<CommentResponseDto[]>;
  
  abstract findByAuctionId(auctionId: string): Promise<CommentResponseDto[]>;
  
  abstract create(accountId: string, data: CreateCommentDto): Promise<CommentResponseDto>;
  
  abstract update(id: string, content: string): Promise<CommentResponseDto>;
  
  abstract delete(id: string): Promise<void>;
}
