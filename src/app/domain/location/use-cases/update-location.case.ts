import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UpdateLocationDto } from '../dtos/requests/update-location.request.dto';
import { LocationResponseDto } from '../dtos/responses/location.response.dto';
import { ILocationRepository } from '@/app/infra/repositories/interfaces/location.interface.repository';

@Injectable()
export class UpdateLocationCase {
  constructor(
    @Inject(ILocationRepository)
    private readonly locationRepository: ILocationRepository
  ) {}

  async execute(id: string, data: UpdateLocationDto): Promise<LocationResponseDto> {
    const existing = await this.locationRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Location not found');
    }

    return await this.locationRepository.update(id, data);
  }
}
