import { PaginationResponseDto } from '@/common/utils/dtos/responses/pagination.response.dto';
import { FilterBusinessDto } from '../../../home/business/dtos/requests/filter-business.request.dto';
import { BusinessResponseDto } from '../../../home/business/dtos/responses/business.response.dto';
import { CreateBusinessDto } from '../../../home/business/dtos/requests/create-business.request.dto';
import { UpdateBusinessDto } from '../../../home/business/dtos/requests/update-business.request.dto';

export abstract class IBusinessRepository {
  abstract findById(id: number): Promise<BusinessResponseDto | null>;
  
  abstract findByUuid(uuid: string): Promise<BusinessResponseDto | null>;
  
  abstract findWithFilters(
    filters: FilterBusinessDto,
    page: number,
    limit: number,
    orderBy?: string,
    orderDirection?: 'ASC' | 'DESC'
  ): Promise<PaginationResponseDto<BusinessResponseDto[]>>;
  
  abstract create(
    accountId: number,
    data: CreateBusinessDto
  ): Promise<BusinessResponseDto>;
  
  abstract update(
    id: number,
    data: UpdateBusinessDto
  ): Promise<BusinessResponseDto>;
  
  abstract delete(id: number): Promise<void>;
  
  abstract search(
    query: string,
    page: number,
    limit: number
  ): Promise<PaginationResponseDto<BusinessResponseDto[]>>;
  
  abstract getLatest(limit: number): Promise<BusinessResponseDto[]>;
  
  abstract findByLocationProximity(
    lat: number,
    lng: number,
    categoryId: number,
    maxDistanceInKM: number
  ): Promise<BusinessResponseDto[]>;
  
  abstract findByAccountId(
    accountId: number,
    page: number,
    limit: number
  ): Promise<PaginationResponseDto<BusinessResponseDto[]>>;
  
  abstract incrementViews(id: number): Promise<void>;
  
  abstract promote(id: number): Promise<void>;
  
  abstract countByAccountId(accountId: number): Promise<number>;
}
