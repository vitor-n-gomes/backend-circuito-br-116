import { Injectable, Inject } from "@nestjs/common";
import { IEntityRepository } from "../repositories/interfaces/entity.interface.repository";

@Injectable()
export class FindWithFiltersCase {
  constructor(
    @Inject(IEntityRepository)
    private readonly entityRepository: IEntityRepository
  ) {}

  async execute(): Promise<any> {
    const data = this.entityRepository.findWithFilters({}, 1, 30);

    return data;
  }
}
