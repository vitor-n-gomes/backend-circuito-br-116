import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './models/comment.entity';
import { ICommentRepository } from '../interfaces/comment.interface.repository';
import { CommentResponseDto } from '@/app/home/comments/dtos/responses/comment.response.dto';
import { CreateCommentDto } from '@/app/home/comments/dtos/requests/create-comment.request.dto';
import { toObjectResponseMapper } from './mappers/to-object-response.mapper';

@Injectable()
export class CommentRepository implements ICommentRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>
  ) {}

  async findById(id: string): Promise<CommentResponseDto | null> {
    const comment = await this.commentRepo.findOne({ where: { id } });
    return toObjectResponseMapper(comment, CommentResponseDto);
  }

  async findByBusinessId(businessId: string): Promise<CommentResponseDto[]> {
    const comments = await this.commentRepo
      .createQueryBuilder('c')
      .where('c.businessId = :businessId', { businessId })
      .andWhere('c.parentCommentId IS NULL')
      .orderBy('c.createdAt', 'DESC')
      .getMany();

    return comments.map((c) => toObjectResponseMapper(c, CommentResponseDto));
  }

  async findByAuctionId(auctionId: string): Promise<CommentResponseDto[]> {
    const comments = await this.commentRepo
      .createQueryBuilder('c')
      .where('c.auctionId = :auctionId', { auctionId })
      .andWhere('c.parentCommentId IS NULL')
      .orderBy('c.createdAt', 'DESC')
      .getMany();

    return comments.map((c) => toObjectResponseMapper(c, CommentResponseDto));
  }

  async create(accountId: string, data: CreateCommentDto): Promise<CommentResponseDto> {
    const comment = this.commentRepo.create({
      ...data,
      accountId,
    });

    const saved = await this.commentRepo.save(comment);
    return toObjectResponseMapper(saved, CommentResponseDto);
  }

  async update(id: string, content: string): Promise<CommentResponseDto> {
    await this.commentRepo.update({ id }, { content });
    const updated = await this.commentRepo.findOne({ where: { id } });
    return toObjectResponseMapper(updated, CommentResponseDto);
  }

  async delete(id: string): Promise<void> {
    // Delete replies first
    await this.commentRepo.delete({ parentCommentId: id });
    // Delete the comment
    await this.commentRepo.delete({ id });
  }
}
