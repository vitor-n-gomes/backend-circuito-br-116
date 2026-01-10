import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  ParseIntPipe,
  ParseFloatPipe,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiParam, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { CreateBusinessDto } from '../dtos/requests/create-business.request.dto';
import { UpdateBusinessDto } from '../dtos/requests/update-business.request.dto';
import { FilterBusinessDto } from '../dtos/requests/filter-business.request.dto';
import { BusinessResponseDto } from '../dtos/responses/business.response.dto';
import { PaginationResponseDto } from '@/common/utils/dtos/responses/pagination.response.dto';
import { CreateBusinessCase } from '../use-cases/create-business.case';
import { UpdateBusinessCase } from '../use-cases/update-business.case';
import { DeleteBusinessCase } from '../use-cases/delete-business.case';
import { FindBusinessByIdCase } from '../use-cases/find-business-by-id.case';
import { FilterBusinessesCase } from '../use-cases/filter-businesses.case';
import { SearchBusinessesCase } from '../use-cases/search-businesses.case';
import { GetLatestBusinessesCase } from '../use-cases/get-latest-businesses.case';
import { GetBusinessesByAccountCase } from '../use-cases/get-businesses-by-account.case';
import { GetBusinessesByProximityCase } from '../use-cases/get-businesses-by-proximity.case';
import { IncrementBusinessViewsCase } from '../use-cases/increment-business-views.case';

@ApiTags('Business')
@Controller('businesses')
export class BusinessController {
  constructor(
    private readonly createBusinessCase: CreateBusinessCase,
    private readonly updateBusinessCase: UpdateBusinessCase,
    private readonly deleteBusinessCase: DeleteBusinessCase,
    private readonly findBusinessByIdCase: FindBusinessByIdCase,
    private readonly filterBusinessesCase: FilterBusinessesCase,
    private readonly searchBusinessesCase: SearchBusinessesCase,
    private readonly getLatestBusinessesCase: GetLatestBusinessesCase,
    private readonly getBusinessesByAccountCase: GetBusinessesByAccountCase,
    private readonly getBusinessesByProximityCase: GetBusinessesByProximityCase,
    private readonly incrementBusinessViewsCase: IncrementBusinessViewsCase
  ) {}

  @Get('latest')
  @ApiOperation({ summary: 'Get latest businesses' })
  @ApiResponse({ status: 200, type: [BusinessResponseDto] })
  async getLatest(): Promise<BusinessResponseDto[]> {
    return await this.getLatestBusinessesCase.execute(12);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new business' })
  @ApiResponse({ status: 201, type: BusinessResponseDto })
  async create(
    @Body(new ValidationPipe({ transform: true })) data: CreateBusinessDto,
    @Query('accountId', ParseIntPipe) accountId: number
  ): Promise<BusinessResponseDto> {
    try{
      return await this.createBusinessCase.execute(accountId, data);
    }catch(error) {
        console.log(error);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a business' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, type: BusinessResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) data: UpdateBusinessDto
  ): Promise<BusinessResponseDto> {
    return await this.updateBusinessCase.execute(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a business' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200 })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.deleteBusinessCase.execute(id);
    return { success: true };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search businesses by keyword' })
  @ApiQuery({ name: 'query', type: 'string', example: 'restaurant' })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 20 })
  @ApiResponse({ status: 200, type: PaginationResponseDto<BusinessResponseDto[]> })
  async search(
    @Query('query') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ): Promise<PaginationResponseDto<BusinessResponseDto[]>> {
    return await this.searchBusinessesCase.execute(query, page, limit);
  }

  @Post('filter')
  @HttpCode(200)
  @ApiOperation({ summary: 'Filter businesses with advanced criteria' })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 20 })
  @ApiQuery({ name: 'orderBy', required: false, type: 'string', example: 'createdAt' })
  @ApiQuery({ name: 'orderDirection', required: false, enum: ['ASC', 'DESC'], example: 'DESC' })
  @ApiResponse({ status: 200, type: PaginationResponseDto<BusinessResponseDto[]> })
  async filter(
    @Body(new ValidationPipe({ transform: true })) filters: FilterBusinessDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('orderBy') orderBy?: string,
    @Query('orderDirection') orderDirection?: 'ASC' | 'DESC'
  ): Promise<PaginationResponseDto<BusinessResponseDto[]>> {
    return await this.filterBusinessesCase.execute(
      filters,
      page,
      limit,
      orderBy,
      orderDirection
    );
  }

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get businesses by account ID' })
  @ApiParam({ name: 'accountId', type: 'number', example: 1 })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 20 })
  @ApiResponse({ status: 200, type: PaginationResponseDto<BusinessResponseDto[]> })
  async getByAccount(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ): Promise<PaginationResponseDto<BusinessResponseDto[]>> {
    return await this.getBusinessesByAccountCase.execute(accountId, page, limit);
  }

  @Get('proximity/:lat/:lng/:categoryId')
  @ApiOperation({ summary: 'Get businesses by location proximity' })
  @ApiParam({ name: 'lat', type: 'number', example: -23.5505 })
  @ApiParam({ name: 'lng', type: 'number', example: -46.6333 })
  @ApiParam({ name: 'categoryId', type: 'number', example: 1 })
  @ApiQuery({ name: 'maxDistance', required: false, type: 'number', example: 5 })
  @ApiResponse({ status: 200, type: [BusinessResponseDto] })
  async getByProximity(
    @Param('lat', ParseFloatPipe) lat: number,
    @Param('lng', ParseFloatPipe) lng: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('maxDistance') maxDistance?: number
  ): Promise<BusinessResponseDto[]> {
    return await this.getBusinessesByProximityCase.execute(
      lat,
      lng,
      categoryId,
      maxDistance || 5
    );
  }

  @Get('details/:id')
  @ApiOperation({ summary: 'Get business by ID' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, type: BusinessResponseDto })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<BusinessResponseDto> {
    return await this.findBusinessByIdCase.execute(id);
  }

  @Post('details/:id/increment-views')
  @HttpCode(200)
  @ApiOperation({ summary: 'Increment business view count' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200 })
  async incrementViews(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.incrementBusinessViewsCase.execute(id);
    return { success: true };
  }
}
