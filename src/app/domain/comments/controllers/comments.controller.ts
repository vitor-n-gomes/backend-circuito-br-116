import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiParam, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { CreateCommentDto } from '../dtos/requests/create-comment.request.dto';
import { CommentResponseDto } from '../dtos/responses/comment.response.dto';
import { CreateCommentCase } from '../use-cases/create-comment.case';
import { GetCommentsByBusinessCase } from '../use-cases/get-comments-by-business.case';
import { DeleteCommentCase } from '../use-cases/delete-comment.case';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly createCommentCase: CreateCommentCase,
    private readonly getCommentsByBusinessCase: GetCommentsByBusinessCase,
    private readonly deleteCommentCase: DeleteCommentCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiQuery({ name: 'accountId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  async create(
    @Body(new ValidationPipe({ transform: true })) data: CreateCommentDto,
    @Query('accountId', ParseUUIDPipe) accountId: string
  ): Promise<CommentResponseDto> {
    return await this.createCommentCase.execute(accountId, data);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get comments by business ID' })
  @ApiParam({ name: 'businessId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: [CommentResponseDto] })
  async getByBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string
  ): Promise<CommentResponseDto[]> {
    return await this.getCommentsByBusinessCase.execute(businessId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200 })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<{ success: boolean }> {
    await this.deleteCommentCase.execute(id);
    return { success: true };
  }
}
