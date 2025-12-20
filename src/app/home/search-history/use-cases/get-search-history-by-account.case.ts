import { Injectable, Inject } from '@nestjs/common';
import { SearchHistoryResponseDto } from '../dtos/responses/search-history.response.dto';
import { ISearchHistoryRepository } from '@/app/infra/repositories/interfaces/search-history.interface.repository';

@Injectable()
export class GetSearchHistoryByAccountCase {
  constructor(
    @Inject(ISearchHistoryRepository)
    private readonly searchHistoryRepository: ISearchHistoryRepository
  ) {}

  async execute(accountId: string, limit?: number): Promise<SearchHistoryResponseDto[]> {
    return await this.searchHistoryRepository.findByAccountId(accountId, limit);
  }
}
