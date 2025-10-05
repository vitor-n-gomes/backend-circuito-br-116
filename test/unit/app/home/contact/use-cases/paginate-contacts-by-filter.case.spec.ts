import { PaginateContactsByFilterCase } from "@/app/home/contact/use-cases/paginate-contacts-by-filter.case";
import { IContactRepository } from "@/app/home/contact/repositories/interfaces/contact.interface.repository";
import { PaginationRequestDto } from "@/app/home/contact/dtos/requests/pagination.request.dto";
import { ContactResponseDto } from "@/app/home/contact/dtos/responses/contact.response.dto";
import { PaginationResponseDto } from "@/common/utils/dtos/responses/pagination.response.dto";
import { expectedResultContactList } from "../mocks/contact-result.mock";

describe("PaginateContactsByFilterCase", () => {
  let paginateContactsByFilterCase: PaginateContactsByFilterCase;
  let contactRepository: jest.Mocked<IContactRepository>;

  beforeEach(() => {
    contactRepository = {
      findWithFilters: jest.fn(),
    } as any;
    paginateContactsByFilterCase = new PaginateContactsByFilterCase(contactRepository);
  });

  it("should return paginated contacts with filters", async () => {
    const paginationRequest: PaginationRequestDto = {
      filter: { query: "jorge" },
      page: 1,
      limit: 10,
    };

    const mockPaginationResponse: PaginationResponseDto<ContactResponseDto[]> = expectedResultContactList
    contactRepository.findWithFilters.mockResolvedValue(mockPaginationResponse);

    const result = await paginateContactsByFilterCase.execute(paginationRequest);

    expect(contactRepository.findWithFilters).toHaveBeenCalledWith(
      paginationRequest.filter,
      paginationRequest.page,
      paginationRequest.limit
    );
    expect(result).toEqual(mockPaginationResponse);
  });

  it("should return empty data if no contacts match filter", async () => {
    const paginationRequest: PaginationRequestDto = {
      filter: { query: "Nonexistent" },
      page: 1,
      limit: 10,
    };
    const mockPaginationResponse: PaginationResponseDto<ContactResponseDto[]> = {
      data: [],
      currentPage: 1,
      totalElements: 0,
      lastPage: 1,
      firstPage: 0
    };
    contactRepository.findWithFilters.mockResolvedValue(mockPaginationResponse);

    const result = await paginateContactsByFilterCase.execute(paginationRequest);

    expect(contactRepository.findWithFilters).toHaveBeenCalledWith(
      paginationRequest.filter,
      paginationRequest.page,
      paginationRequest.limit
    );
    expect(result).toEqual(mockPaginationResponse);
  });
});
