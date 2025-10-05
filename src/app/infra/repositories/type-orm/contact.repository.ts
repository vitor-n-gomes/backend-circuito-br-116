import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Contact } from "./models/contact.entity";
import { IContactRepository } from "../interfaces/contact.interface.repository";
import { FilterRequestDto } from "../../../home/contact/dtos/requests/filter.request.dto";
import { PaginationResponseDto } from "@/common/utils/dtos/responses/pagination.response.dto";
import { toPaginationResponseMapper } from "./mappers/to-pagination-response.mapper";
import { toObjectResponseMapper } from "./mappers/to-object-response.mapper";
import { ContactResponseDto } from "@/app/home/contact/dtos/responses/contact.response.dto";

@Injectable()
export class ContactRepository implements IContactRepository {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>
  ) {}

  async findById(id: number): Promise<ContactResponseDto | null> {
    const contact = await this.contactRepo.findOne({ where: { id } });
    return toObjectResponseMapper(contact, ContactResponseDto);
  }

  async findWithFilters(
    filters: FilterRequestDto,
    page: number,
    limit: number
  ): Promise<PaginationResponseDto<ContactResponseDto[]>> {
    const queryBuilder = this.contactRepo.createQueryBuilder("c");

    queryBuilder.andWhere("nivel < :level", {
      level: "z",
    });

    if (filters.query) {
      queryBuilder.where(
        "MATCH(empresa, cidade, palavras, palavrachave) AGAINST (:query IN BOOLEAN MODE)",
        { query: `${filters.query}*` }
      );
    }

    if (filters.city) {
      queryBuilder.andWhere("c.cidade ILIKE :city", {
        city: `%${filters.city}%`,
      });
    }

    const skip = (page - 1) * limit;

    queryBuilder.orderBy("c.nivel", "DESC");
    queryBuilder.orderBy("c.datacadastro", "DESC");

    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return toPaginationResponseMapper(
      data,
      total,
      page,
      limit,
      ContactResponseDto
    );
  }
}
