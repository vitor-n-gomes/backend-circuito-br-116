import { FilterRequestDto } from "../../dtos/requests/filter.request.dto";
import { Entity } from "../type-orm/models/entity.entity";

export abstract class IEntityRepository {
  abstract findByUuid(uuid: string): Promise<any>;
  abstract findWithFilters(
    filters: FilterRequestDto,
    page: number,
    limit: number
  ): Promise<{ data: Entity[]; total: number }>;
}
