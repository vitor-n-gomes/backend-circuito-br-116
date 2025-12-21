import { Injectable, Inject } from '@nestjs/common';
import { IAccountRepository } from '@/app/infra/repositories/interfaces/account.interface.repository';
import { AccountResponseDto } from '../dtos/responses/account.response.dto';

@Injectable()
export class SearchAccountsCase {
  constructor(
    @Inject(IAccountRepository)
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(keyword: string, page: number = 1, perPage: number = 5): Promise<AccountResponseDto[]> {
    if (!keyword) {
      throw new Error('Keyword parameter required');
    }
    
    return this.accountRepository.search(keyword, page - 1, perPage);
  }
}
