import { Module } from "@nestjs/common";
import { ContactController } from "./controllers/contact.controller";
import { PaginateContactsByFilterCase} from "./use-cases/paginate-contacts-by-filter.case";
import { RepositoryModule } from "./repositories/repositoy.module";
import { FindContactByIdCase } from "./use-cases/find-contact-by-id.case";

@Module({
  controllers: [ContactController],
  imports: [RepositoryModule],
  providers: [PaginateContactsByFilterCase, FindContactByIdCase],
})
export class ContactModule {}
