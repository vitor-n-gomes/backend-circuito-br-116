import { Injectable, Inject } from '@nestjs/common';
import { CreateBusinessDto } from '../dtos/requests/create-business.request.dto';
import { BusinessResponseDto } from '../dtos/responses/business.response.dto';
import { IBusinessRepository } from '@/app/infra/repositories/interfaces/business.interface.repository';

@Injectable()
export class CreateBusinessCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: IBusinessRepository
  ) {}

  async execute(
    accountId: number,
    data: CreateBusinessDto
  ): Promise<BusinessResponseDto> {
    return await this.businessRepository.create(accountId, data);
  }
}
