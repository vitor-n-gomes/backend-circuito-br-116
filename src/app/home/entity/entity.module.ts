import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Entity } from "./entity.entity";
import { EntityRepository } from "./repositories/type-orm/entity.repository";
import { EntityController } from "./controllers/entity.controller";
import { FindWithFiltersCase } from "./use-cases/find-with-filters.use-case";

@Module({
  controllers: [EntityController],
  imports: [TypeOrmModule.forFeature([Entity])],
  providers: [EntityRepository, FindWithFiltersCase],
  exports: [EntityRepository],
})
export class EntityModule {}
