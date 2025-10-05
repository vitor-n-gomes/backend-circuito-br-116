import { ContactResponseDto } from "@/app/home/contact/dtos/responses/contact.response.dto";
import { PaginationResponseDto } from "@/common/utils/dtos/responses/pagination.response.dto";
import { contactList } from "./contact-list.mock";
import { PaginationRequestDto } from "@/app/home/contact/dtos/requests/pagination.request.dto";

export const expectedResultContactList: PaginationResponseDto<
  ContactResponseDto[]
> = {
  data: [{ ...contactList[0] }],
  currentPage: 1,
  totalElements: 1,
  nextPage: null,
  lastPage: 1,
  firstPage: 1,
  previousPage: null,
};

export const paginationFilter: PaginationRequestDto = {
  filter: {
    query: "Jorge"
  },
  page: 1,
  limit: 10
}