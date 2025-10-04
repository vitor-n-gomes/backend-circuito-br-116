import { Module } from "@nestjs/common";
import { EntityRepository } from "./entity.repository";
import { IEntityRepository } from "../interfaces/entity.interface.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Entity } from "./models/entity.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  providers: [
    {
      provide: IEntityRepository,
      useClass: EntityRepository,
    },
  ],
  exports: [IEntityRepository],
})
export class TypeOrmRepositoryModule {}
