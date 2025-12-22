import { Injectable, Inject } from '@nestjs/common';
import { IAccountRepository } from '@/app/infra/repositories/interfaces/account.interface.repository';
import { AccountResponseDto } from '../dtos/responses/account.response.dto';

@Injectable()
export class GetAuthenticatedAccountCase {
  constructor(
    @Inject(IAccountRepository)
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(accountId: string): Promise<AccountResponseDto> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    
    // Set raw email for authenticated account
    if (account.email) {
      account.rawEmail = account.email;
    }
    
    return account;
  }
}
