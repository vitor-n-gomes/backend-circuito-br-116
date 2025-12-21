import { Injectable, Inject } from '@nestjs/common';
import { IAccountRepository } from '@/app/infra/repositories/interfaces/account.interface.repository';
import { AccountResponseDto } from '../dtos/responses/account.response.dto';

@Injectable()
export class GetAccountDetailsCase {
  constructor(
    @Inject(IAccountRepository)
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(accountId: string): Promise<AccountResponseDto | null> {
    if (!accountId || accountId === 'null' || accountId === 'undefined') {
      throw new Error('Invalid account ID');
    }

    const account = await this.accountRepository.getOneWithDetails(accountId);
    
    if (!account) {
      return null;
    }

    // Remove sensitive fields for public profile
    delete account.allowedNotifications;
    delete account.acceptedTermsAndCondition;
    delete account.blockedAccounts;
    delete account.deviceFCMToken;
    delete account.categoriesSetupDone;
    delete account.coins;
    delete account.email;
    delete account.preferredCategoriesIds;
    delete account.identities;
    
    return account;
  }
}
