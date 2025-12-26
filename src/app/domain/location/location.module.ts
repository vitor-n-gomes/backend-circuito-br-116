import { Module } from '@nestjs/common';
import { LocationController } from './controllers/location.controller';
import { GetAllLocationsCase } from './use-cases/get-all-locations.case';
import { CreateLocationCase } from './use-cases/create-location.case';
import { UpdateLocationCase } from './use-cases/update-location.case';
import { DeleteLocationCase } from './use-cases/delete-location.case';
import { InfraModule } from '@/app/infra/infra.module';

@Module({
  controllers: [LocationController],
  imports: [InfraModule],
  providers: [
    GetAllLocationsCase,
    CreateLocationCase,
    UpdateLocationCase,
    DeleteLocationCase,
  ],
})
export class LocationModule {}
