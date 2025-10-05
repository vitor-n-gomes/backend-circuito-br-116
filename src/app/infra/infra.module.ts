import { Module } from "@nestjs/common";
import { RepositoryModule } from "./repositories/repositoy.module";
@Module({
  imports: [RepositoryModule],
  exports: [RepositoryModule]
})
export class InfraModule {}
