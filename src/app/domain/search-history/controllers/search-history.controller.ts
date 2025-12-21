import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  ValidationPipe,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { CreateSearchHistoryDto } from '../dtos/requests/create-search-history.request.dto';
import { SearchHistoryResponseDto } from '../dtos/responses/search-history.response.dto';
import { GetSearchHistoryByAccountCase } from '../use-cases/get-search-history-by-account.case';
import { CreateSearchHistoryCase } from '../use-cases/create-search-history.case';

@ApiTags('Search History')
@Controller('search-history')
export class SearchHistoryController {
  constructor(
    private readonly getSearchHistoryByAccountCase: GetSearchHistoryByAccountCase,
    private readonly createSearchHistoryCase: CreateSearchHistoryCase
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get search history by account' })
  @ApiQuery({ name: 'accountId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 50 })
  @ApiResponse({ status: 200, type: [SearchHistoryResponseDto] })
  async getByAccount(
    @Query('accountId', ParseUUIDPipe) accountId: string,
    @Query('limit') limit?: number
  ): Promise<SearchHistoryResponseDto[]> {
    return await this.getSearchHistoryByAccountCase.execute(accountId, limit);
  }

  @Post()
  @ApiOperation({ summary: 'Create a search history entry' })
  @ApiQuery({ name: 'accountId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, type: SearchHistoryResponseDto })
  async create(
    @Body(new ValidationPipe({ transform: true })) data: CreateSearchHistoryDto,
    @Query('accountId', ParseUUIDPipe) accountId: string
  ): Promise<SearchHistoryResponseDto> {
    return await this.createSearchHistoryCase.execute(accountId, data);
  }
}
