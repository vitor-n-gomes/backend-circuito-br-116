import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from './models/search-history.entity';
import { ISearchHistoryRepository } from '../interfaces/search-history.interface.repository';
import { SearchHistoryResponseDto } from '@/app/domain/search-history/dtos/responses/search-history.response.dto';
import { CreateSearchHistoryDto } from '@/app/domain/search-history/dtos/requests/create-search-history.request.dto';
import { toObjectResponseMapper } from './mappers/to-object-response.mapper';

@Injectable()
export class SearchHistoryRepository implements ISearchHistoryRepository {
  constructor(
    @InjectRepository(SearchHistory)
    private readonly searchHistoryRepo: Repository<SearchHistory>
  ) {}

  async findByAccountId(accountId: string, limit: number = 50): Promise<SearchHistoryResponseDto[]> {
    const items = await this.searchHistoryRepo.find({
      where: { accountId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return items.map((item) => toObjectResponseMapper(item, SearchHistoryResponseDto));
  }

  async create(accountId: string, data: CreateSearchHistoryDto): Promise<SearchHistoryResponseDto> {
    const item = this.searchHistoryRepo.create({
      ...data,
      accountId,
    });
    const saved = await this.searchHistoryRepo.save(item);
    return toObjectResponseMapper(saved, SearchHistoryResponseDto);
  }

  async deleteByAccountId(accountId: string): Promise<void> {
    await this.searchHistoryRepo.delete({ accountId });
  }
}
