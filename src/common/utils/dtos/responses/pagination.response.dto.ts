import { ApiProperty } from "@nestjs/swagger";

export class PaginationResponseDto<D> {
  @ApiProperty({
    type: Array,
    description: "List of entities for the current page.",
  })
  data: D;

  @ApiProperty({ example: 1, description: "Current page number." })
  currentPage: number;

  @ApiProperty({ example: 100, description: "Total number of elements." })
  totalElements: number;

  @ApiProperty({
    example: 2,
    description: "Next page number, or null if last page.",
  })
  nextPage?: number;

  @ApiProperty({ example: 10, description: "Last page number." })
  lastPage: number;

  @ApiProperty({ example: 1, description: "First page number." })
  firstPage: number;

  @ApiProperty({
    example: 1,
    description: "Previous page number, or null if first page.",
  })
  previousPage?: number;
}
