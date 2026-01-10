import { Controller, Get, Post, Put, Delete, Body, Param, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CategoryResponseDto } from '../dtos/responses/category.response.dto';
import { CreateCategoryDto } from '../dtos/requests/create-category.request.dto';
import { UpdateCategoryDto } from '../dtos/requests/update-category.request.dto';
import { GetAllCategoriesCase } from '../use-cases/get-all-categories.case';
import { GetAllCategoriesForBusinessCase } from '../use-cases/get-all-categories-for-business.case';
import { CreateCategoryCase } from '../use-cases/create-category.case';
import { UpdateCategoryCase } from '../use-cases/update-category.case';
import { DeleteCategoryCase } from '../use-cases/delete-category.case';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly getAllCategoriesCase: GetAllCategoriesCase,
    private readonly getAllCategoriesForBusinessCase: GetAllCategoriesForBusinessCase,
    private readonly createCategoryCase: CreateCategoryCase,
    private readonly updateCategoryCase: UpdateCategoryCase,
    private readonly deleteCategoryCase: DeleteCategoryCase
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

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, type: CategoryResponseDto })
  async create(
    @Body(new ValidationPipe({ transform: true })) data: CreateCategoryDto
  ): Promise<CategoryResponseDto> {
    return await this.createCategoryCase.execute(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', type: 'string', description: 'Category UUID' })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) data: UpdateCategoryDto
  ): Promise<CategoryResponseDto> {
    return await this.updateCategoryCase.execute(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', type: 'string', description: 'Category UUID' })
  @ApiResponse({ status: 200 })
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.deleteCategoryCase.execute(id);
    return { success: true };
  }
}
