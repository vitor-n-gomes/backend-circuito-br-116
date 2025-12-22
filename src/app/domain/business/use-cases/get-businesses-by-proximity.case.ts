import { Injectable, Inject } from '@nestjs/common';
import { BusinessResponseDto } from '../dtos/responses/business.response.dto';
import { IBusinessRepository } from '@/app/infra/repositories/interfaces/business.interface.repository';

@Injectable()
export class GetBusinessesByProximityCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: IBusinessRepository
  ) {}

  async execute(
    lat: number,
    lng: number,
    categoryId: number,
    maxDistance: number = 5
  ): Promise<BusinessResponseDto[]> {
    return await this.businessRepository.findByLocationProximity(
      lat,
      lng,
      categoryId,
      maxDistance
    );
  }
}
