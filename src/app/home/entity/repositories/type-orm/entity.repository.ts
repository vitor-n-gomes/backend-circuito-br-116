import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Entity } from "../../entity.entity";
import { IEntityRepository } from "../interfaces/entity.interface.repository";
import { FilterRequestDto } from "../../dtos/requests/filter.request.dto";

@Injectable()
export class EntityRepository implements IEntityRepository {
  constructor(
    @InjectRepository(Entity)
    private readonly entityRepo: Repository<Entity>
  ) {}

  findById(id: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async findWithFilters(
    filters: FilterRequestDto,
    page: number,
    limit: number
  ): Promise<{ data: any[]; total: number }> {
    const queryBuilder = this.entityRepo.createQueryBuilder("c");

    console.debug(queryBuilder.getQuery());

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }
}
