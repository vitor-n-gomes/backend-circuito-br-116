import { AccountResponseDto } from '../../../home/accounts/dtos/responses/account.response.dto';
import { CreateAccountDto } from '../../../home/accounts/dtos/requests/create-account.dto';
import { UpdateAccountDto } from '../../../home/accounts/dtos/requests/update-account.dto';

export interface AccountStatsDto {
  auctions: number;
  bids: number;
  acceptedBids: number;
  rejectedBids: number;
  activeAuctions: number;
  closedAuctions: number;
}

export interface AccountExtraDetailsDto {
  followersCount: number;
  followingCount: number;
  reviewsCount: number;
  reviewsAverage: number;
  activeAuctionsCount: number;
}

export abstract class IAccountRepository {
  abstract findById(id: string): Promise<AccountResponseDto | null>;
  abstract findByAuthId(authId: string): Promise<AccountResponseDto | null>;
  abstract findOneOrCreate(
    authId: string,
    accountData: CreateAccountDto,
    identities: Record<string, string[]>,
    phone?: string
  ): Promise<AccountResponseDto>;
  abstract search(
    query: string,
    page: number,
    perPage: number
  ): Promise<AccountResponseDto[]>;
  abstract getStats(accountId: string): Promise<AccountStatsDto>;
  abstract getOneWithDetails(accountId: string): Promise<AccountResponseDto | null>;
  abstract blockAccount(currentAccountId: string, accountToBlock: string): Promise<void>;
  abstract unblockAccount(currentAccountId: string, accountToUnblock: string): Promise<void>;
  abstract hasVerificationRequest(accountId: string): Promise<boolean>;
  abstract requestVerification(accountId: string): Promise<void>;
  abstract update(id: string, data: UpdateAccountDto): Promise<AccountResponseDto>;
  abstract deleteAccountData(accountId: string): Promise<void>;
}
