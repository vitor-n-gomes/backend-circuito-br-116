import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ICommentRepository } from '@/app/infra/repositories/interfaces/comment.interface.repository';

@Injectable()
export class DeleteCommentCase {
  constructor(
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository
  ) {}

  async execute(id: string): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    await this.commentRepository.delete(id);
  }
}
