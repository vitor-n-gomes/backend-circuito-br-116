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
  const nextPage = page < lastPage ? page + 1 : null;
  const previousPage = page > 1 ? page - 1 : null;

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
