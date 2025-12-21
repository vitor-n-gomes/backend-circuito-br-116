import { Injectable, Inject } from '@nestjs/common';
import { IAccountRepository } from '@/app/infra/repositories/interfaces/account.interface.repository';

@Injectable()
export class DeleteAccountDataCase {
  constructor(
    @Inject(IAccountRepository)
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(accountId: string): Promise<{ success: boolean }> {
    await this.accountRepository.deleteAccountData(accountId);
    
    // Note: Firebase user deletion would need to be handled separately
    // This would require firebase-admin integration
    
    return { success: true };
  }
}
