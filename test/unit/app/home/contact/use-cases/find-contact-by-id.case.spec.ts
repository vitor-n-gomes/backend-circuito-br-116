import { FindContactByIdCase } from "@/app/home/contact/use-cases/find-contact-by-id.case";
import { IContactRepository } from "@/app/infra/repositories/interfaces/contact.interface.repository";
import { ContactResponseDto } from "@/app/home/contact/dtos/responses/contact.response.dto";
import { SingleContactFactory } from "../mocks/contact.factory";

describe("FindContactByIdCase", () => {
  let findContactByIdCase: FindContactByIdCase;
  let contactRepository: jest.Mocked<IContactRepository>;

  beforeEach(() => {
    contactRepository = {
      findById: jest.fn(),
      // ...other methods if needed
    } as any;
    findContactByIdCase = new FindContactByIdCase(contactRepository);
  });

  it("should return contact data when found", async () => {
    const mockContact: ContactResponseDto = SingleContactFactory();
    contactRepository.findById.mockResolvedValue(mockContact);

    const result = await findContactByIdCase.execute(1);

    expect(contactRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockContact);
  });

  it("should return undefined or null if contact not found", async () => {
    contactRepository.findById.mockResolvedValue(undefined as any);

    const result = await findContactByIdCase.execute(999);

    expect(contactRepository.findById).toHaveBeenCalledWith(999);
    expect(result).toBeUndefined();
  });
});
 