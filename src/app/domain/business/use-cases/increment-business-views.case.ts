import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IBusinessRepository } from '@/app/infra/repositories/interfaces/business.interface.repository';

@Injectable()
export class IncrementBusinessViewsCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: IBusinessRepository
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.businessRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Business not found');
    }

    await this.businessRepository.incrementViews(id);
  }
}
