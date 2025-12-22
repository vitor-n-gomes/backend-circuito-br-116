import { Injectable, Inject } from '@nestjs/common';
import { CommentResponseDto } from '../dtos/responses/comment.response.dto';
import { ICommentRepository } from '@/app/infra/repositories/interfaces/comment.interface.repository';

@Injectable()
export class GetCommentsByBusinessCase {
  constructor(
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository
  ) {}

  async execute(businessId: string): Promise<CommentResponseDto[]> {
    return await this.commentRepository.findByBusinessId(businessId);
  }
}
