import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ILocationRepository } from '@/app/infra/repositories/interfaces/location.interface.repository';

@Injectable()
export class DeleteLocationCase {
  constructor(
    @Inject(ILocationRepository)
    private readonly locationRepository: ILocationRepository
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.locationRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Location not found');
    }

    await this.locationRepository.delete(id);
  }
}
