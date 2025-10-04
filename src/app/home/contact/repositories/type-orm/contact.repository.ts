import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Contact } from "./models/contact.entity";
import { IContactRepository } from "../interfaces/contact.interface.repository";
import { FilterRequestDto } from "../../dtos/requests/filter.request.dto";

@Injectable()
export class ContactRepository implements IContactRepository {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>
  ) {}

  async findByUuid(uuid: string): Promise<Contact | null> {
    return await this.contactRepo.findOne({
      where: { uuid },
    });
  }

  async findWithFilters(
    filters: FilterRequestDto,
    page: number,
    limit: number
  ): Promise<{ data: Contact[]; total: number }> {
    const queryBuilder = this.contactRepo.createQueryBuilder("c");

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }
}
