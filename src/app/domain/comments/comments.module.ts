import { Module } from '@nestjs/common';
import { CommentsController } from './controllers/comments.controller';
import { CreateCommentCase } from './use-cases/create-comment.case';
import { GetCommentsByBusinessCase } from './use-cases/get-comments-by-business.case';
import { DeleteCommentCase } from './use-cases/delete-comment.case';
import { InfraModule } from '@/app/infra/infra.module';

@Module({
  controllers: [CommentsController],
  imports: [InfraModule],
  providers: [CreateCommentCase, GetCommentsByBusinessCase, DeleteCommentCase],
})
export class CommentsModule {}
