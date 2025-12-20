import { Module } from "@nestjs/common";
import { ContactModule } from "./contact/contact.module";
import { BusinessModule } from "./business/business.module";

@Module({
  imports: [ContactModule, BusinessModule],
})
export class HomeModule {}
