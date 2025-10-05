import { PaginationResponseDto } from "@/common/utils/dtos/responses/pagination.response.dto";
import { plainToInstance } from "class-transformer";

export function toPaginationResponseMapper<T, D extends object>(
  data: D[],
  total: number,
  page: number,
  limit: number,
  dtoClass: new () => T
): PaginationResponseDto<T[]> {
  const lastPage = Math.ceil(total / limit);
  const nextPage = Number(page) < lastPage ? Number(page) + 1 : null;
  const previousPage = Number(page) > 1 ? Number(page) - 1 : null;

  const mappedData: T[] = data.map((item) => plainToInstance(dtoClass, item));

  return {
    data: mappedData,
    currentPage: page,
    totalElements: total,
    nextPage,
    lastPage,
    firstPage: 1,
    previousPage,
  };
}
