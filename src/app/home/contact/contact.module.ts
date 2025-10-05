import { Module } from "@nestjs/common";
import { ContactController } from "./controllers/contact.controller";
import { PaginateContactsByFilterCase } from "./use-cases/paginate-contacts-by-filter.case";
import { FindContactByIdCase } from "./use-cases/find-contact-by-id.case";
import { InfraModule } from "@/app/infra/infra.module";

@Module({
  controllers: [ContactController],
  imports: [InfraModule],
  providers: [PaginateContactsByFilterCase, FindContactByIdCase],
})
export class ContactModule {}
