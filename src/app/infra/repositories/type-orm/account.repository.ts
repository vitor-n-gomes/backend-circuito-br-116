import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAccountRepository, AccountStatsDto } from '../interfaces/account.interface.repository';
import { Account } from './models/account.entity';
import { AccountResponseDto } from '../../../domain/accounts/dtos/responses/account.response.dto';
import { CreateAccountDto } from '../../../domain/accounts/dtos/requests/create-account.dto';
import { UpdateAccountDto } from '../../../domain/accounts/dtos/requests/update-account.dto';
import { toObjectResponseMapper } from './mappers/to-object-response.mapper';

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    @InjectRepository(Account)
    private readonly repository: Repository<Account>
  ) {}

  async findById(id: string): Promise<AccountResponseDto | null> {
    const entity = await this.repository.findOne({
      where: { id }
    });
    return entity ? toObjectResponseMapper(entity, AccountResponseDto) : null;
  }

  async findByAuthId(authId: string): Promise<AccountResponseDto | null> {
    const entity = await this.repository.findOne({
      where: { authId }
    });
    return entity ? toObjectResponseMapper(entity, AccountResponseDto) : null;
  }

  async findOneOrCreate(
    authId: string,
    accountData: CreateAccountDto,
    identities: Record<string, string[]>,
    phone?: string
  ): Promise<AccountResponseDto> {
    const existing = await this.findByAuthId(authId);
    if (existing) {
      return existing;
    }

    const accountEmail = accountData.email || this.generateAnonymousEmail();
    const newAccount = this.repository.create({
      ...accountData,
      authId,
      email: accountEmail,
      isAnonymous: !accountData.email,
      picture: accountData.picture || `https://icotar.com/avatar/${accountEmail}.png`,
      identities,
      phone,
      allowedNotifications: {
        NEW_COMMENT_ON_BUSINESS: true,
        BUSINESS_UPDATED: true,
        COMMENT_REPLY: true,
        REVIEW_RECEIVED: true,
        NEW_MESSAGE: true,
        SYSTEM: true,
        NEW_FOLLOWER: true,
        BUSINESS_FROM_FAVOURITES_UPDATED: true,
        NEW_BUSINESS_FROM_FOLLOWING: true,
        BUSINESS_ADDED_TO_FAVOURITES: true,
        FAVOURITE_BUSINESS_UPDATED: true,
      },
    });

    const saved = await this.repository.save(newAccount);
    return toObjectResponseMapper(saved, AccountResponseDto);
  }

  async search(query: string, page: number, perPage: number): Promise<AccountResponseDto[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('account')
      .where('account.name ILIKE :query OR account.email ILIKE :query', { query: `%${query}%` })
      .orderBy('account.name', 'ASC')
      .skip(page * perPage)
      .take(perPage);

    const entities = await queryBuilder.getMany();
    
    return entities.map(entity => {
      const dto = toObjectResponseMapper(entity, AccountResponseDto);
      // Mask email
      if (dto.email) {
        const [localPart] = dto.email.split('@');
        dto.email = `${localPart}@${'*'.repeat(7)}`;
      }
      return dto;
    });
  }

  async getStats(accountId: string): Promise<AccountStatsDto> {
    const account = await this.repository.findOne({
      where: { id: accountId },
      relations: ['businesses', 'comments', 'searchHistories', 'lastSeenBusinesses'],
    });

    if (!account) {
      return {
        businesses: 0,
        comments: 0,
        searchHistory: 0,
        lastSeenBusinesses: 0,
      };
    }

    return {
      businesses: account.businesses?.length || 0,
      comments: account.comments?.length || 0,
      searchHistory: account.searchHistories?.length || 0,
      lastSeenBusinesses: account.lastSeenBusinesses?.length || 0,
    };
  }

  async getOneWithDetails(accountId: string): Promise<AccountResponseDto | null> {
    const entity = await this.repository.findOne({
      where: { id: accountId }
    });
    return entity ? toObjectResponseMapper(entity, AccountResponseDto) : null;
  }

  async blockAccount(currentAccountId: string, accountToBlock: string): Promise<void> {
    const account = await this.repository.findOne({ where: { id: currentAccountId } });
    if (!account) {
      throw new Error('Account not found');
    }

    const blockedAccounts = account.blockedAccounts || [];
    if (!blockedAccounts.includes(accountToBlock)) {
      blockedAccounts.push(accountToBlock);
      await this.repository.update(
        { id: currentAccountId },
        { blockedAccounts }
      );
    }
  }

  async unblockAccount(currentAccountId: string, accountToUnblock: string): Promise<void> {
    const account = await this.repository.findOne({ where: { id: currentAccountId } });
    if (!account) {
      throw new Error('Account not found');
    }

    const blockedAccounts = account.blockedAccounts || [];
    const index = blockedAccounts.indexOf(accountToUnblock);
    if (index !== -1) {
      blockedAccounts.splice(index, 1);
      await this.repository.update(
        { id: currentAccountId },
        { blockedAccounts }
      );
    }
  }

  async hasVerificationRequest(accountId: string): Promise<boolean> {
    const account = await this.repository.findOne({
      where: { id: accountId },
      select: ['verificationRequestedAt'],
    });
    return !!account?.verificationRequestedAt;
  }

  async requestVerification(accountId: string): Promise<void> {
    await this.repository.update(
      { id: accountId },
      { verificationRequestedAt: new Date() }
    );
  }

  async update(id: string, data: UpdateAccountDto): Promise<AccountResponseDto> {
    const account = await this.repository.findOne({ where: { id } });
    if (!account) {
      throw new Error('Account not found');
    }

    const updateData: Partial<Account> = { ...data };
    if (data.meta) {
      updateData.meta = { ...account.meta, ...data.meta };
    }

    await this.repository.update({ id }, updateData);

    const updated = await this.repository.findOne({
      where: { id }
    });
    return toObjectResponseMapper(updated, AccountResponseDto);
  }

  async deleteAccountData(accountId: string): Promise<void> {
    // This is a complex operation that would need to cascade delete related data
    // For now, just delete the account
    await this.repository.delete({ id: accountId });
  }

  private generateAnonymousEmail(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `anonymous_${timestamp}_${random}@circuitobr116.com.br`;
  }
}
