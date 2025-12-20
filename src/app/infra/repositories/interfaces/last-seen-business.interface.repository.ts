import { LastSeenBusinessResponseDto } from '../../../home/last-seen-business/dtos/responses/last-seen-business.response.dto';
import { CreateLastSeenBusinessDto } from '../../../home/last-seen-business/dtos/requests/create-last-seen-business.request.dto';

export abstract class ILastSeenBusinessRepository {
  abstract findByAccountId(accountId: number, limit?: number): Promise<LastSeenBusinessResponseDto[]>;
  
  abstract create(accountId: number, data: CreateLastSeenBusinessDto): Promise<LastSeenBusinessResponseDto>;
  
  abstract updateLastSeen(accountId: number, businessId: string): Promise<LastSeenBusinessResponseDto>;
  
  abstract deleteByAccountId(accountId: number): Promise<void>;
}
