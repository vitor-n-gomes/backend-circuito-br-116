import { Injectable, Inject } from '@nestjs/common';
import { CreateLocationDto } from '../dtos/requests/create-location.request.dto';
import { LocationResponseDto } from '../dtos/responses/location.response.dto';
import { ILocationRepository } from '@/app/infra/repositories/interfaces/location.interface.repository';

@Injectable()
export class CreateLocationCase {
  constructor(
    @Inject(ILocationRepository)
    private readonly locationRepository: ILocationRepository
  ) {}

  async execute(data: CreateLocationDto): Promise<LocationResponseDto> {
    return await this.locationRepository.create(data);
  }
}
