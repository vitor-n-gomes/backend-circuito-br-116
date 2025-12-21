import { SearchHistoryResponseDto } from '../../../domain/search-history/dtos/responses/search-history.response.dto';
import { CreateSearchHistoryDto } from '../../../domain/search-history/dtos/requests/create-search-history.request.dto';

export abstract class ISearchHistoryRepository {
  abstract findByAccountId(accountId: string, limit?: number): Promise<SearchHistoryResponseDto[]>;
  
  abstract create(accountId: string, data: CreateSearchHistoryDto): Promise<SearchHistoryResponseDto>;
  
  abstract deleteByAccountId(accountId: string): Promise<void>;
}
