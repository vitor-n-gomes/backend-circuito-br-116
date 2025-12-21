import { Injectable, Inject } from '@nestjs/common';
import { IAccountRepository } from '@/app/infra/repositories/interfaces/account.interface.repository';

@Injectable()
export class UnblockAccountCase {
  constructor(
    @Inject(IAccountRepository)
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(currentAccountId: string, accountToUnblock: string): Promise<{ success: boolean }> {
    await this.accountRepository.unblockAccount(currentAccountId, accountToUnblock);
    return { success: true };
  }
}
