import { Injectable, Inject } from '@nestjs/common';
import { CreateSearchHistoryDto } from '../dtos/requests/create-search-history.request.dto';
import { SearchHistoryResponseDto } from '../dtos/responses/search-history.response.dto';
import { ISearchHistoryRepository } from '@/app/infra/repositories/interfaces/search-history.interface.repository';

@Injectable()
export class CreateSearchHistoryCase {
  constructor(
    @Inject(ISearchHistoryRepository)
    private readonly searchHistoryRepository: ISearchHistoryRepository
  ) {}

  async execute(accountId: string, data: CreateSearchHistoryDto): Promise<SearchHistoryResponseDto> {
    return await this.searchHistoryRepository.create(accountId, data);
  }
}
