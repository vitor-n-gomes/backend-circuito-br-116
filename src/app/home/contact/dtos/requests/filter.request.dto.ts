import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class FilterRequestDto {
  @ApiPropertyOptional({
    example: "search term",
    description: "Text to filter entities by name, description or category",
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    example: "City",
    description: "Text to filter entities by city",
  })
  @IsOptional()
  @IsString()
  city?: string;
}
