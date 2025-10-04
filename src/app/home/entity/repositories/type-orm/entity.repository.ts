import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Entity } from "./models/entity.entity";
import { IEntityRepository } from "../interfaces/entity.interface.repository";
import { FilterRequestDto } from "../../dtos/requests/filter.request.dto";

@Injectable()
export class EntityRepository implements IEntityRepository {
  constructor(
    @InjectRepository(Entity)
    private readonly entityRepo: Repository<Entity>
  ) {}

  async findByUuid(uuid: string): Promise<Entity | null> {
    return await this.entityRepo.findOne({
      where: { uuid },
    });
  }

  async findWithFilters(
    filters: FilterRequestDto,
    page: number,
    limit: number
  ): Promise<{ data: Entity[]; total: number }> {
    const queryBuilder = this.entityRepo.createQueryBuilder("c");

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }
}
