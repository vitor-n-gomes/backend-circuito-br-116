import { Injectable, Inject } from "@nestjs/common";
import { EntityRepository } from "../repositories/type-orm/entity.repository";

@Injectable()
export class FindWithFiltersCase {

    constructor(
        @Inject(EntityRepository) private readonly entityRepository: EntityRepository,
    ) { }

    async execute(): Promise<any> {
        const data = this.entityRepository.findWithFilters({}, 1, 30);

        return data;
    }

}