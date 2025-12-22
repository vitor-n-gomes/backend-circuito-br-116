import { Injectable, Inject } from '@nestjs/common';
import { CreateLastSeenBusinessDto } from '../dtos/requests/create-last-seen-business.request.dto';
import { LastSeenBusinessResponseDto } from '../dtos/responses/last-seen-business.response.dto';
import { ILastSeenBusinessRepository } from '@/app/infra/repositories/interfaces/last-seen-business.interface.repository';

@Injectable()
export class RecordLastSeenBusinessCase {
  constructor(
    @Inject(ILastSeenBusinessRepository)
    private readonly lastSeenBusinessRepository: ILastSeenBusinessRepository
  ) {}

  async execute(accountId: number, data: CreateLastSeenBusinessDto): Promise<LastSeenBusinessResponseDto> {
    return await this.lastSeenBusinessRepository.create(accountId, data);
  }
}
