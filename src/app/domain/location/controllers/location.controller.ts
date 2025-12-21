import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { LocationResponseDto } from '../dtos/responses/location.response.dto';
import { GetAllLocationsCase } from '../use-cases/get-all-locations.case';

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly getAllLocationsCase: GetAllLocationsCase) {}

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, type: [LocationResponseDto] })
  async getAll(): Promise<LocationResponseDto[]> {
    return await this.getAllLocationsCase.execute();
  }
}
