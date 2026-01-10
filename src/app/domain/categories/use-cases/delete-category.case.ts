import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ICategoryRepository } from '@/app/infra/repositories/interfaces/category.interface.repository';

@Injectable()
export class DeleteCategoryCase {
  constructor(
    @Inject(ICategoryRepository)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepository.delete(id);
  }
}
