import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IAccountRepository, AccountStatsDto } from '../interfaces/account.interface.repository';
import { Account } from './models/account.entity';
import { AccountResponseDto } from '../../../home/accounts/dtos/responses/account.response.dto';
import { CreateAccountDto } from '../../../home/accounts/dtos/requests/create-account.dto';
import { UpdateAccountDto } from '../../../home/accounts/dtos/requests/update-account.dto';
import { toObjectResponseMapper } from './mappers/to-object-response.mapper';

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    @InjectRepository(Account)
    private readonly repository: Repository<Account>,
    private readonly dataSource: DataSource
  ) {}

  async findById(id: string): Promise<AccountResponseDto | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['asset', 'selectedCurrency'],
    });
    return entity ? toObjectResponseMapper(entity, AccountResponseDto) : null;
  }

  async findByAuthId(authId: string): Promise<AccountResponseDto | null> {
    const entity = await this.repository.findOne({
      where: { authId },
      relations: ['asset', 'selectedCurrency'],
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
        NEW_BID_ON_AUCTION: true,
        AUCTION_UPDATED: true,
        BID_REMOVED_ON_AUCTION: false,
        BID_ACCEPTED_ON_AUCTION: true,
        BID_REJECTED_ON_AUCTION: true,
        REVIEW_RECEIVED: true,
        NEW_MESSAGE: true,
        SYSTEM: true,
        SOMEONE_ELSE_ADDED_BID_TO_SAME_AUCTION: true,
        BID_WAS_SEEN: true,
        NEW_FOLLOWER: true,
        AUCTION_FROM_FAVOURITES_HAS_BID: true,
        NEW_AUCTION_FROM_FOLLOWING: true,
        AUCTION_ADDED_TO_FAVOURITES: true,
        FAVOURITE_AUCTION_PRICE_CHANGE: true,
      },
    });

    const saved = await this.repository.save(newAccount);
    return toObjectResponseMapper(saved, AccountResponseDto);
  }

  async search(query: string, page: number, perPage: number): Promise<AccountResponseDto[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.asset', 'asset')
      .where('account.name ILIKE :query OR account.email ILIKE :query', { query: `%${query}%` })
      .orderBy(`POSITION(:rawQuery IN account.name)`, 'DESC')
      .addOrderBy('account.name', 'DESC')
      .setParameter('rawQuery', query)
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
    // This would need Business and Bid entities to be properly implemented
    // For now, returning a basic structure
    return {
      auctions: 0,
      bids: 0,
      acceptedBids: 0,
      rejectedBids: 0,
      activeAuctions: 0,
      closedAuctions: 0,
    };
  }

  async getOneWithDetails(accountId: string): Promise<AccountResponseDto | null> {
    const entity = await this.repository.findOne({
      where: { id: accountId },
      relations: ['asset'],
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

    // Parse locationLatLng if provided
    let locationLat = data.locationLat;
    let locationLong = data.locationLong;
    if (data.locationLatLng) {
      try {
        const [lat, lng] = JSON.parse(data.locationLatLng);
        locationLat = lat;
        locationLong = lng;
      } catch (error) {
        // Invalid JSON, skip
      }
    }

    // Merge metadata
    const meta = data.meta ? { ...account.meta, ...data.meta } : account.meta;

    await this.repository.update(
      { id },
      {
        ...data,
        locationLat,
        locationLong,
        meta,
      }
    );

    const updated = await this.repository.findOne({
      where: { id },
      relations: ['asset', 'selectedCurrency'],
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
    return `anonymous_${timestamp}_${random}@biddo.app`;
  }
}
