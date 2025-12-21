import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './models/category.entity';
import { ICategoryRepository } from '../interfaces/category.interface.repository';
import { CategoryResponseDto } from '@/app/domain/categories/dtos/responses/category.response.dto';
import { CreateCategoryDto } from '@/app/domain/categories/dtos/requests/create-category.request.dto';
import { toObjectResponseMapper } from './mappers/to-object-response.mapper';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>
  ) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepo.find({
      order: { createdAt: 'ASC' },
    });

    return categories.map((cat) => toObjectResponseMapper(cat, CategoryResponseDto));
  }

  async findAllWithBusinessCount(): Promise<CategoryResponseDto[]> {
    // Query categories with business count using subquery
    const categories = await this.categoryRepo
      .createQueryBuilder('category')
      .loadRelationCountAndMap('category.businessCount', 'category.businesses')
      .orderBy('category.createdAt', 'ASC')
      .getMany();

    return categories.map((cat: any) => {
      const dto = toObjectResponseMapper(cat, CategoryResponseDto);
      dto.businessCount = cat.businessCount || 0;
      return dto;
    });
  }

  async findById(id: string): Promise<CategoryResponseDto | null> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    return toObjectResponseMapper(category, CategoryResponseDto);
  }

  async create(data: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = this.categoryRepo.create(data);
    const saved = await this.categoryRepo.save(category);
    return toObjectResponseMapper(saved, CategoryResponseDto);
  }

  async update(id: string, data: Partial<CreateCategoryDto>): Promise<CategoryResponseDto> {
    await this.categoryRepo.update({ id }, data);
    const updated = await this.categoryRepo.findOne({ where: { id } });
    return toObjectResponseMapper(updated, CategoryResponseDto);
  }

  async delete(id: string): Promise<void> {
    // Delete the category
    await this.categoryRepo.delete({ id });
  }
}
