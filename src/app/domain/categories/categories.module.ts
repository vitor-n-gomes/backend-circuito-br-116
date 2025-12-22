import { Module } from '@nestjs/common';
import { CategoriesController } from './controllers/categories.controller';
import { GetAllCategoriesCase } from './use-cases/get-all-categories.case';
import { GetAllCategoriesForBusinessCase } from './use-cases/get-all-categories-for-business.case';
import { InfraModule } from '@/app/infra/infra.module';

@Module({
  controllers: [CategoriesController],
  imports: [InfraModule],
  providers: [GetAllCategoriesCase, GetAllCategoriesForBusinessCase],
})
export class CategoriesModule {}
