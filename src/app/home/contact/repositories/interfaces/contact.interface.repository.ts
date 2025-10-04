import { FilterRequestDto } from "../../dtos/requests/filter.request.dto";
import { Contact } from "../type-orm/models/contact.entity";

export abstract class IContactRepository {
  abstract findByUuid(uuid: string): Promise<any>;
  abstract findWithFilters(
    filters: FilterRequestDto,
    page: number,
    limit: number
  ): Promise<{ data: Contact[]; total: number }>;
}
