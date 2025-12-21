import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BusinessResponseDto } from '../dtos/responses/business.response.dto';
import { IBusinessRepository } from '@/app/infra/repositories/interfaces/business.interface.repository';

@Injectable()
export class FindBusinessByIdCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: IBusinessRepository
  ) {}

  async execute(id: number): Promise<BusinessResponseDto> {
    const business = await this.businessRepository.findById(id);
    
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }
}
