import { Injectable, Inject } from '@nestjs/common';
import { FilterBusinessDto } from '../dtos/requests/filter-business.request.dto';
import { BusinessResponseDto } from '../dtos/responses/business.response.dto';
import { PaginationResponseDto } from '@/common/utils/dtos/responses/pagination.response.dto';
import { IBusinessRepository } from '@/app/infra/repositories/interfaces/business.interface.repository';

@Injectable()
export class FilterBusinessesCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: IBusinessRepository
  ) {}

  async execute(
    filters: FilterBusinessDto,
    page: number,
    limit: number,
    orderBy?: string,
    orderDirection?: 'ASC' | 'DESC'
  ): Promise<PaginationResponseDto<BusinessResponseDto[]>> {
    return await this.businessRepository.findWithFilters(
      filters,
      page,
      limit,
      orderBy,
      orderDirection
    );
  }
}
