import { IsOptional, IsInt, Min, IsArray } from 'class-validator';
import { ApiProperty} from '@nestjs/swagger';
import { EntityResponseDto } from './entity.response.dto';

export class PaginationResponseDto {
    @ApiProperty({ type: [EntityResponseDto], description: 'List of entities for the current page.' })
    @IsArray()
    data: EntityResponseDto[];

    @ApiProperty({ example: 1, description: 'Current page number.' })
    @IsInt()
    @Min(1)
    currentPage: number;

    @ApiProperty({ example: 100, description: 'Total number of elements.' })
    @IsInt()
    @Min(0)
    totalElements: number;

    @ApiProperty({ example: 2, description: 'Next page number, or null if last page.' })
    @IsOptional()
    @IsInt()
    nextPage?: number;

    @ApiProperty({ example: 10, description: 'Last page number.' })
    @IsInt()
    @Min(1)
    lastPage: number;

    @ApiProperty({ example: 1, description: 'First page number.' })
    @IsInt()
    @Min(1)
    firstPage: number;

    @ApiProperty({ example: 1, description: 'Previous page number, or null if first page.' })
    @IsOptional()
    @IsInt()
    previousPage?: number;
}
