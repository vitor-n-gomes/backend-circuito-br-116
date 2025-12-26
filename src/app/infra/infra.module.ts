import { Module } from "@nestjs/common";
import { RepositoryModule } from "./repositories/repositoy.module";
import { MapsModule } from "./maps/maps.module";
import { StorageModule } from "./storage/storage.module";

@Module({
  imports: [RepositoryModule, MapsModule, StorageModule],
  exports: [RepositoryModule, MapsModule, StorageModule],
})
export class InfraModule {}
