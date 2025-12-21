import { Injectable, Inject } from '@nestjs/common';
import { LastSeenBusinessResponseDto } from '../dtos/responses/last-seen-business.response.dto';
import { ILastSeenBusinessRepository } from '@/app/infra/repositories/interfaces/last-seen-business.interface.repository';

@Injectable()
export class GetLastSeenBusinessesByAccountCase {
  constructor(
    @Inject(ILastSeenBusinessRepository)
    private readonly lastSeenBusinessRepository: ILastSeenBusinessRepository
  ) {}

  async execute(accountId: number, limit?: number): Promise<LastSeenBusinessResponseDto[]> {
    return await this.lastSeenBusinessRepository.findByAccountId(accountId, limit);
  }
}
