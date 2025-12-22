import { Module } from '@nestjs/common';
import { SearchHistoryController } from './controllers/search-history.controller';
import { GetSearchHistoryByAccountCase } from './use-cases/get-search-history-by-account.case';
import { CreateSearchHistoryCase } from './use-cases/create-search-history.case';
import { InfraModule } from '@/app/infra/infra.module';

@Module({
  controllers: [SearchHistoryController],
  imports: [InfraModule],
  providers: [GetSearchHistoryByAccountCase, CreateSearchHistoryCase],
})
export class SearchHistoryModule {}
