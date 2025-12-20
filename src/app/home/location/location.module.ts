import { Module } from '@nestjs/common';
import { LocationController } from './controllers/location.controller';
import { GetAllLocationsCase } from './use-cases/get-all-locations.case';
import { InfraModule } from '@/app/infra/infra.module';

@Module({
  controllers: [LocationController],
  imports: [InfraModule],
  providers: [GetAllLocationsCase],
})
export class LocationModule {}
