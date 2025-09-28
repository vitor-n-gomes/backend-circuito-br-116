import { FilterRequestDto } from "../../dtos/requests/filter.request.dto";

export interface IEntityRepository {
  findById(id: string): Promise<any>;
  findWithFilters(
    filters: FilterRequestDto,
    page: number,
    limit: number
  ): Promise<any>;
}
