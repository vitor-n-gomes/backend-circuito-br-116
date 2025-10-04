import { Controller, Get, Query, Param, ValidationPipe } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiParam } from "@nestjs/swagger";
import { PaginationRequestDto } from "../dtos/requests/pagination.request.dto";
import { ContactResponseDto } from "../dtos/responses/contact.response.dto";
import { PaginateContactsByFilterCase} from "../use-cases/paginate-contacts-by-filter.case";
import { PaginationResponseDto } from "@/common/utils/dtos/responses/pagination.response.dto";
import { FindContactByIdCase } from "../use-cases/find-contact-by-id.case";

@ApiTags("Contact")
@Controller("contacts")
export class ContactController {
  constructor(private readonly paginateContactsByFilterCase: PaginateContactsByFilterCase, private readonly findContactByIdCase: FindContactByIdCase) { }

  @Get()
  @ApiResponse({ status: 200, type: PaginationResponseDto<ContactResponseDto[]> })
  async listContacts(
    @Query('filter[city]', new ValidationPipe({ transform: true })) city: string,
    @Query('filter[query]', new ValidationPipe({ transform: true })) query: string,
    @Query() pagination: PaginationRequestDto
  ): Promise<PaginationResponseDto<ContactResponseDto[]>> {

    pagination.filter = {
      city,
      query
    }

    const data = await this.paginateContactsByFilterCase.execute(pagination);

    return data;
  }

  @Get(":id")
  @ApiParam({
    name: "id",
    type: "number",
    example: 1,
  })
  @ApiResponse({ status: 200, type: ContactResponseDto })
  async getContactById(
    @Param("id") id: number
  ): Promise<ContactResponseDto> {
   
    const data = await this.findContactByIdCase.execute(id);

    return data;
  }
}
