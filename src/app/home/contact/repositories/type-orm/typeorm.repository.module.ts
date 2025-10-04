import { Module } from "@nestjs/common";
import { ContactRepository } from "./contact.repository";
import { IContactRepository } from "../interfaces/contact.interface.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Contact } from "./models/contact.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Contact])],
  providers: [
    {
      provide: IContactRepository,
      useClass: ContactRepository,
    },
  ],
  exports: [IContactRepository],
})
export class TypeOrmRepositoryModule {}
