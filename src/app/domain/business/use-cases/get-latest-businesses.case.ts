import { Injectable, Inject } from '@nestjs/common';
import { BusinessResponseDto } from '../dtos/responses/business.response.dto';
import { IBusinessRepository } from '@/app/infra/repositories/interfaces/business.interface.repository';

@Injectable()
export class GetLatestBusinessesCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: IBusinessRepository
  ) {}

  async execute(limit: number = 12): Promise<BusinessResponseDto[]> {
    return await this.businessRepository.getLatest(limit);
  }
}
