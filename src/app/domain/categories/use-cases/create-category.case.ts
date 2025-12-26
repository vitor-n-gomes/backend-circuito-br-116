import { Injectable, Inject } from '@nestjs/common';
import { CreateCategoryDto } from '../dtos/requests/create-category.request.dto';
import { CategoryResponseDto } from '../dtos/responses/category.response.dto';
import { ICategoryRepository } from '@/app/infra/repositories/interfaces/category.interface.repository';

@Injectable()
export class CreateCategoryCase {
  constructor(
    @Inject(ICategoryRepository)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(data: CreateCategoryDto): Promise<CategoryResponseDto> {
    return await this.categoryRepository.create(data);
  }
}
