import { Injectable, Inject } from '@nestjs/common';
import { CreateCommentDto } from '../dtos/requests/create-comment.request.dto';
import { CommentResponseDto } from '../dtos/responses/comment.response.dto';
import { ICommentRepository } from '@/app/infra/repositories/interfaces/comment.interface.repository';

@Injectable()
export class CreateCommentCase {
  constructor(
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository
  ) {}

  async execute(accountId: string, data: CreateCommentDto): Promise<CommentResponseDto> {
    return await this.commentRepository.create(accountId, data);
  }
}
