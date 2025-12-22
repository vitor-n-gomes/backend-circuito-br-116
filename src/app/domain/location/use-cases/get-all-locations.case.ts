import { Injectable, Inject } from '@nestjs/common';
import { LocationResponseDto } from '../dtos/responses/location.response.dto';
import { ILocationRepository } from '@/app/infra/repositories/interfaces/location.interface.repository';

@Injectable()
export class GetAllLocationsCase {
  constructor(
    @Inject(ILocationRepository)
    private readonly locationRepository: ILocationRepository
  ) {}

  async execute(): Promise<LocationResponseDto[]> {
    return await this.locationRepository.findAll();
  }
}
