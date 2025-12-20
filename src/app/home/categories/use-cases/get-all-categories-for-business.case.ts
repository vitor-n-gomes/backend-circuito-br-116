import { Injectable, Inject } from '@nestjs/common';
import { CategoryResponseDto } from '../dtos/responses/category.response.dto';
import { ICategoryRepository } from '@/app/infra/repositories/interfaces/category.interface.repository';

@Injectable()
export class GetAllCategoriesForBusinessCase {
  constructor(
    @Inject(ICategoryRepository)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(): Promise<CategoryResponseDto[]> {
    return await this.categoryRepository.findAllWithBusinessCount();
  }
}
