import { Module } from "@nestjs/common";
import { ContactController } from "./controllers/contact.controller";
import { FindWithFiltersCase } from "./use-cases/find-with-filters.use-case";
import { RepositoryModule } from "./repositories/repositoy.module";

@Module({
  controllers: [ContactController],
  imports: [RepositoryModule],
  providers: [FindWithFiltersCase],
})
export class ContactModule {}
