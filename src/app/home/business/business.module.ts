import { Module } from '@nestjs/common';
import { BusinessController } from './controllers/business.controller';
import { CreateBusinessCase } from './use-cases/create-business.case';
import { UpdateBusinessCase } from './use-cases/update-business.case';
import { DeleteBusinessCase } from './use-cases/delete-business.case';
import { FindBusinessByIdCase } from './use-cases/find-business-by-id.case';
import { FilterBusinessesCase } from './use-cases/filter-businesses.case';
import { SearchBusinessesCase } from './use-cases/search-businesses.case';
import { GetLatestBusinessesCase } from './use-cases/get-latest-businesses.case';
import { GetBusinessesByAccountCase } from './use-cases/get-businesses-by-account.case';
import { GetBusinessesByProximityCase } from './use-cases/get-businesses-by-proximity.case';
import { IncrementBusinessViewsCase } from './use-cases/increment-business-views.case';
import { InfraModule } from '@/app/infra/infra.module';

@Module({
  controllers: [BusinessController],
  imports: [InfraModule],
  providers: [
    CreateBusinessCase,
    UpdateBusinessCase,
    DeleteBusinessCase,
    FindBusinessByIdCase,
    FilterBusinessesCase,
    SearchBusinessesCase,
    GetLatestBusinessesCase,
    GetBusinessesByAccountCase,
    GetBusinessesByProximityCase,
    IncrementBusinessViewsCase,
  ],
})
export class BusinessModule {}
