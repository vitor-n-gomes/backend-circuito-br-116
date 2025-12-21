import { Injectable, Inject } from '@nestjs/common';
import { IAccountRepository } from '@/app/infra/repositories/interfaces/account.interface.repository';

@Injectable()
export class RequestVerificationCase {
  constructor(
    @Inject(IAccountRepository)
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(accountId: string): Promise<{ success: boolean }> {
    const alreadyAsked = await this.accountRepository.hasVerificationRequest(accountId);
    
    if (alreadyAsked) {
      throw new Error('Already requested verification');
    }
    
    await this.accountRepository.requestVerification(accountId);
    return { success: true };
  }
}
