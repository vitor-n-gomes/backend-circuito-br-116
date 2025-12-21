import { Injectable, Inject } from '@nestjs/common';
import { BusinessResponseDto } from '../dtos/responses/business.response.dto';
import { PaginationResponseDto } from '@/common/utils/dtos/responses/pagination.response.dto';
import { IBusinessRepository } from '@/app/infra/repositories/interfaces/business.interface.repository';

@Injectable()
export class SearchBusinessesCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: IBusinessRepository
  ) {}

  async execute(
    query: string,
    page: number,
    limit: number
  ): Promise<PaginationResponseDto<BusinessResponseDto[]>> {
    return await this.businessRepository.search(query, page, limit);
  }
}
