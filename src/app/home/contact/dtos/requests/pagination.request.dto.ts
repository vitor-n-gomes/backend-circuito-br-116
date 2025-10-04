import { IsOptional, IsInt, Min, Max, IsObject, ValidateNested } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { FilterRequestDto } from "./filter.request.dto";

export class PaginationRequestDto {
  @ApiPropertyOptional({
    example: "search filters",
    description: "Text to filter entities by name or description.",
  })
  @IsOptional()
  @IsObject()
  filter?: FilterRequestDto;

  @ApiPropertyOptional({
    example: 0,
    description: "Page number for pagination.",
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: "Number of items per page.",
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
