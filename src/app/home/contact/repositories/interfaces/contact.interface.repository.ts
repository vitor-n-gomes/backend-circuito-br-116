import { PaginationResponseDto } from "@/common/utils/dtos/responses/pagination.response.dto";
import { FilterRequestDto } from "../../dtos/requests/filter.request.dto";
import { ContactResponseDto } from "../../dtos/responses/contact.response.dto";
export abstract class IContactRepository {
  abstract findById(id: number): Promise<ContactResponseDto | null>;
  abstract findWithFilters(
    filters: FilterRequestDto,
    page: number,
    limit: number
  ): Promise<PaginationResponseDto<ContactResponseDto[]>>;
}
