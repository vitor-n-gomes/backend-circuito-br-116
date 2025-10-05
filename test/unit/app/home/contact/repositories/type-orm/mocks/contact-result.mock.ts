import { ContactResponseDto } from "@/app/home/contact/dtos/responses/contact.response.dto";
import { PaginationResponseDto } from "@/common/utils/dtos/responses/pagination.response.dto";
import { contactList } from "./contact-list.mock";

export const expectedResultContactList: PaginationResponseDto<ContactResponseDto[]> = {
    data: [
        { ...contactList[0] }
    ],
    currentPage: 1,
    totalElements: 1,
    nextPage: null,
    lastPage: 1,
    firstPage: 1,
    previousPage: null,
};
