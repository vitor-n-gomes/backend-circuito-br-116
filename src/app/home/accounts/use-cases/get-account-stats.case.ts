import { Injectable, Inject } from '@nestjs/common';
import { IAccountRepository, AccountStatsDto } from '@/app/infra/repositories/interfaces/account.interface.repository';

@Injectable()
export class GetAccountStatsCase {
  constructor(
    @Inject(IAccountRepository)
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(accountId: string): Promise<AccountStatsDto> {
    return this.accountRepository.getStats(accountId);
  }
}
