import { Injectable, Inject } from '@nestjs/common';
import { IAccountRepository } from '@/app/infra/repositories/interfaces/account.interface.repository';

@Injectable()
export class BlockAccountCase {
  constructor(
    @Inject(IAccountRepository)
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(currentAccountId: string, accountToBlock: string): Promise<{ success: boolean }> {
    await this.accountRepository.blockAccount(currentAccountId, accountToBlock);
    return { success: true };
  }
}
