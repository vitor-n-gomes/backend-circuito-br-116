import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UpdateCategoryDto } from '../dtos/requests/update-category.request.dto';
import { CategoryResponseDto } from '../dtos/responses/category.response.dto';
import { ICategoryRepository } from '@/app/infra/repositories/interfaces/category.interface.repository';

@Injectable()
export class UpdateCategoryCase {
  constructor(
    @Inject(ICategoryRepository)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(id: string, data: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    return await this.categoryRepository.update(id, data);
  }
}
