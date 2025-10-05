import { ContactController } from "@/app/home/contact/controllers/contact.controller";
import { PaginateContactsByFilterCase } from "@/app/home/contact/use-cases/paginate-contacts-by-filter.case";
import { FindContactByIdCase } from "@/app/home/contact/use-cases/find-contact-by-id.case";
import { PaginationRequestDto } from "@/app/home/contact/dtos/requests/pagination.request.dto";
import { ContactResponseDto } from "@/app/home/contact/dtos/responses/contact.response.dto";
import { expectedResultContactList } from "../mocks/contact-result.mock";
import { SingleContactFactory } from "../mocks/contact.factory";

describe("ContactController", () => {
  let controller: ContactController;
  let paginateContactsByFilterCase: PaginateContactsByFilterCase;
  let findContactByIdCase: FindContactByIdCase;

  beforeEach(() => {
    paginateContactsByFilterCase = {
      execute: jest.fn(),
    } as any;
    findContactByIdCase = {
      execute: jest.fn(),
    } as any;
    controller = new ContactController(
      paginateContactsByFilterCase,
      findContactByIdCase
    );
  });

  describe("listContacts", () => {
    it("should call paginateContactsByFilterCase.execute with correct params and return data", async () => {
      const pagination: PaginationRequestDto = { page: 1, limit: 10 };
      const city = "Sao Paulo";
      const query = "test";
    
      (paginateContactsByFilterCase.execute as jest.Mock).mockResolvedValue(expectedResultContactList);

      const result = await controller.listContacts(city, query, pagination);

      expect(paginateContactsByFilterCase.execute).toHaveBeenCalledWith({
        ...pagination,
        filter: { city, query },
      });
      expect(result).toBe(expectedResultContactList);
    });
  });

  describe("getContactById", () => {
    it("should call findContactByIdCase.execute with id and return data", async () => {
      const expectedContact: ContactResponseDto = SingleContactFactory();
      (findContactByIdCase.execute as jest.Mock).mockResolvedValue(expectedContact);

      const result = await controller.getContactById(expectedContact.id);

      expect(findContactByIdCase.execute).toHaveBeenCalledWith(expectedContact.id);
      expect(result).toBe(expectedContact);
    });
  });
});
