import { Module } from "@nestjs/common";
import { TypeOrmRepositoryModule } from "./type-orm/typeorm.repository.module";
import { APP_FILTER } from "@nestjs/core";
import { TypeOrmExceptionFilter } from "./type-orm/filters/typeorm-exception.filter";

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: TypeOrmExceptionFilter,
    },
  ],
  imports: [TypeOrmRepositoryModule],
  exports: [TypeOrmRepositoryModule],
})
export class RepositoryModule {}
