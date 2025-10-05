import { Injectable, Inject } from "@nestjs/common";
import { PaginationRequestDto } from "../dtos/requests/pagination.request.dto";
import { ContactResponseDto } from "../dtos/responses/contact.response.dto";
import { PaginationResponseDto } from "@/common/utils/dtos/responses/pagination.response.dto";
import { IContactRepository } from "@/app/infra/repositories/interfaces/contact.interface.repository";

@Injectable()
export class PaginateContactsByFilterCase {
  constructor(
    @Inject(IContactRepository)
    private readonly entityRepository: IContactRepository
  ) {}

  async execute(
    pagination: PaginationRequestDto
  ): Promise<PaginationResponseDto<ContactResponseDto[]>> {
    const data = await this.entityRepository.findWithFilters(
      pagination.filter,
      pagination.page,
      pagination.limit
    );

    return data;
  }
}
