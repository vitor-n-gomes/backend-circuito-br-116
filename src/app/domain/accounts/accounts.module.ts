import { Module } from '@nestjs/common';
import { AccountsController } from './controllers/accounts.controller';
import { GetAuthenticatedAccountCase } from './use-cases/get-authenticated-account.case';
import { SearchAccountsCase } from './use-cases/search-accounts.case';
import { GetAccountStatsCase } from './use-cases/get-account-stats.case';
import { GetAccountDetailsCase } from './use-cases/get-account-details.case';
import { BlockAccountCase } from './use-cases/block-account.case';
import { UnblockAccountCase } from './use-cases/unblock-account.case';
import { RequestVerificationCase } from './use-cases/request-verification.case';
import { DeleteAccountDataCase } from './use-cases/delete-account-data.case';
import { UpdateAccountCase } from './use-cases/update-account.case';
import { InfraModule } from '@/app/infra/infra.module';

@Module({
  controllers: [AccountsController],
  imports: [InfraModule],
  providers: [
    GetAuthenticatedAccountCase,
    SearchAccountsCase,
    GetAccountStatsCase,
    GetAccountDetailsCase,
    BlockAccountCase,
    UnblockAccountCase,
    RequestVerificationCase,
    DeleteAccountDataCase,
    UpdateAccountCase,
  ],
})
export class AccountsModule {}
