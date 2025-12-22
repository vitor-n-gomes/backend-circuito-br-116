import { Injectable, Inject } from '@nestjs/common';
import { CategoryResponseDto } from '../dtos/responses/category.response.dto';
import { ICategoryRepository } from '@/app/infra/repositories/interfaces/category.interface.repository';

@Injectable()
export class GetAllCategoriesCase {
  constructor(
    @Inject(ICategoryRepository)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(): Promise<CategoryResponseDto[]> {
    const allCategories = await this.categoryRepository.findAll();

    // Organize categories with subcategories
    const result = allCategories.reduce((acc: CategoryResponseDto[], category) => {
      if (category.parentCategoryId) {
        const parentCategory = acc.find((item) => item.id === category.parentCategoryId);
        if (parentCategory) {
          if (!parentCategory.subcategories) {
            parentCategory.subcategories = [];
          }
          parentCategory.subcategories.push(category);
        }
      } else {
        acc.push({
          ...category,
          subcategories: [],
        });
      }
      return acc;
    }, []);

    return result;
  }
}
