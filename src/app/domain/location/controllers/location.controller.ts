import { Controller, Get, Post, Put, Delete, Body, Param, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { LocationResponseDto } from '../dtos/responses/location.response.dto';
import { CreateLocationDto } from '../dtos/requests/create-location.request.dto';
import { UpdateLocationDto } from '../dtos/requests/update-location.request.dto';
import { GetAllLocationsCase } from '../use-cases/get-all-locations.case';
import { CreateLocationCase } from '../use-cases/create-location.case';
import { UpdateLocationCase } from '../use-cases/update-location.case';
import { DeleteLocationCase } from '../use-cases/delete-location.case';

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(
    private readonly getAllLocationsCase: GetAllLocationsCase,
    private readonly createLocationCase: CreateLocationCase,
    private readonly updateLocationCase: UpdateLocationCase,
    private readonly deleteLocationCase: DeleteLocationCase
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, type: [LocationResponseDto] })
  async getAll(): Promise<LocationResponseDto[]> {
    return await this.getAllLocationsCase.execute();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({ status: 201, type: LocationResponseDto })
  async create(
    @Body(new ValidationPipe({ transform: true })) data: CreateLocationDto
  ): Promise<LocationResponseDto> {
    return await this.createLocationCase.execute(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a location' })
  @ApiParam({ name: 'id', type: 'string', description: 'Location UUID' })
  @ApiResponse({ status: 200, type: LocationResponseDto })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) data: UpdateLocationDto
  ): Promise<LocationResponseDto> {
    return await this.updateLocationCase.execute(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a location' })
  @ApiParam({ name: 'id', type: 'string', description: 'Location UUID' })
  @ApiResponse({ status: 200 })
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.deleteLocationCase.execute(id);
    return { success: true };
  }
}
