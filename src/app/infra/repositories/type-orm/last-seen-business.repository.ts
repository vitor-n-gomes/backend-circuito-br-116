import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LastSeenBusiness } from './models/last-seen-business.entity';
import { ILastSeenBusinessRepository } from '../interfaces/last-seen-business.interface.repository';
import { LastSeenBusinessResponseDto } from '@/app/home/last-seen-business/dtos/responses/last-seen-business.response.dto';
import { CreateLastSeenBusinessDto } from '@/app/home/last-seen-business/dtos/requests/create-last-seen-business.request.dto';
import { toObjectResponseMapper } from './mappers/to-object-response.mapper';

@Injectable()
export class LastSeenBusinessRepository implements ILastSeenBusinessRepository {
  constructor(
    @InjectRepository(LastSeenBusiness)
    private readonly lastSeenRepo: Repository<LastSeenBusiness>
  ) {}

  async findByAccountId(accountId: number, limit: number = 20): Promise<LastSeenBusinessResponseDto[]> {
    const items = await this.lastSeenRepo.find({
      where: { accountId },
      order: { lastSeenAt: 'DESC' },
      take: limit,
    });
    return items.map((item) => toObjectResponseMapper(item, LastSeenBusinessResponseDto));
  }

  async create(accountId: number, data: CreateLastSeenBusinessDto): Promise<LastSeenBusinessResponseDto> {
    // Check if already exists
    const existing = await this.lastSeenRepo.findOne({
      where: { accountId, businessId: data.businessId },
    });

    if (existing) {
      return this.updateLastSeen(accountId, data.businessId);
    }

    const item = this.lastSeenRepo.create({
      ...data,
      accountId,
      lastSeenAt: new Date(),
    });
    const saved = await this.lastSeenRepo.save(item);
    return toObjectResponseMapper(saved, LastSeenBusinessResponseDto);
  }

  async updateLastSeen(accountId: number, businessId: string): Promise<LastSeenBusinessResponseDto> {
    await this.lastSeenRepo.update(
      { accountId, businessId },
      { lastSeenAt: new Date() }
    );
    const updated = await this.lastSeenRepo.findOne({
      where: { accountId, businessId },
    });
    return toObjectResponseMapper(updated, LastSeenBusinessResponseDto);
  }

  async deleteByAccountId(accountId: number): Promise<void> {
    await this.lastSeenRepo.delete({ accountId });
  }
}
