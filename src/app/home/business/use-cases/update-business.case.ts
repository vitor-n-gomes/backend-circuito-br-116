import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UpdateBusinessDto } from '../dtos/requests/update-business.request.dto';
import { BusinessResponseDto } from '../dtos/responses/business.response.dto';
import { IBusinessRepository } from '@/app/infra/repositories/interfaces/business.interface.repository';

@Injectable()
export class UpdateBusinessCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: IBusinessRepository
  ) {}

  async execute(id: number, data: UpdateBusinessDto): Promise<BusinessResponseDto> {
    const existing = await this.businessRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Business not found');
    }

    return await this.businessRepository.update(id, data);
  }
}
