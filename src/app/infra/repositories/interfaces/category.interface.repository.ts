import { CategoryResponseDto } from '../../../domain/categories/dtos/responses/category.response.dto';
import { CreateCategoryDto } from '../../../domain/categories/dtos/requests/create-category.request.dto';
import { UpdateCategoryDto } from '../../../domain/categories/dtos/requests/update-category.request.dto';

export abstract class ICategoryRepository {
  abstract findAll(): Promise<CategoryResponseDto[]>;
  
  abstract findAllWithBusinessCount(): Promise<CategoryResponseDto[]>;
  
  abstract findById(id: string): Promise<CategoryResponseDto | null>;
  
  abstract create(data: CreateCategoryDto): Promise<CategoryResponseDto>;
  
  abstract update(id: string, data: UpdateCategoryDto): Promise<CategoryResponseDto>;
  
  abstract delete(id: string): Promise<void>;
}
