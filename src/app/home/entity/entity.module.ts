import { Module } from "@nestjs/common";
import { EntityController } from "./controllers/entity.controller";
import { FindWithFiltersCase } from "./use-cases/find-with-filters.use-case";
import { RepositoryModule } from "./repositories/repositoy.module";

@Module({
  controllers: [EntityController],
  imports: [RepositoryModule],
  providers: [FindWithFiltersCase],
})
export class EntityModule {}
