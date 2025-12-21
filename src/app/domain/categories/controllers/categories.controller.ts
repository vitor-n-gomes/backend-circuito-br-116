import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CategoryResponseDto } from '../dtos/responses/category.response.dto';
import { GetAllCategoriesCase } from '../use-cases/get-all-categories.case';
import { GetAllCategoriesForBusinessCase } from '../use-cases/get-all-categories-for-business.case';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly getAllCategoriesCase: GetAllCategoriesCase,
    private readonly getAllCategoriesForBusinessCase: GetAllCategoriesForBusinessCase
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories with subcategories' })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async getAll(): Promise<CategoryResponseDto[]> {
    return await this.getAllCategoriesCase.execute();
  }

  @Get('business')
  @ApiOperation({ summary: 'Get all categories with business count' })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async getAllForBusiness(): Promise<CategoryResponseDto[]> {
    return await this.getAllCategoriesForBusinessCase.execute();
  }
}
