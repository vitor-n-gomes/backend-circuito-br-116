import { Injectable, Inject } from "@nestjs/common";
import { IContactRepository } from "../repositories/interfaces/contact.interface.repository";
import { ContactResponseDto } from "../dtos/responses/contact.response.dto";

@Injectable()
export class FindContactByIdCase {
  constructor(
    @Inject(IContactRepository)
    private readonly entityRepository: IContactRepository
  ) {}

  async execute(id: number): Promise<ContactResponseDto> {
    const data = await this.entityRepository.findById(id);

    return data;
  }
}
