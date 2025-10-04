import { Injectable, Inject } from "@nestjs/common";
import { IContactRepository } from "../repositories/interfaces/contact.interface.repository";

@Injectable()
export class FindWithFiltersCase {
  constructor(
    @Inject(IContactRepository)
    private readonly entityRepository: IContactRepository
  ) {}

  async execute(): Promise<any> {
    const data = this.entityRepository.findWithFilters({}, 1, 30);

    return data;
  }
}
