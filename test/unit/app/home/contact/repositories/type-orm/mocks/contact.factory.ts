import { Contact } from "@/app/home/contact/repositories/type-orm/models/contact.entity";
import { contactList } from "./contact-list.mock";
import { PaginationResponseDto } from "@/common/utils/dtos/responses/pagination.response.dto";
import { ContactResponseDto } from "@/app/home/contact/dtos/responses/contact.response.dto";

export const ContactFactory = (): Contact[] => {
    return contactList.map((data) => {
        const contact = new Contact();
        Object.assign(contact, data);
        return contact;
    });
};

export const SingleContactFactory = (): Contact => {
    const data = contactList[0];
    const contact = new Contact();
    Object.assign(contact, data);
    return contact;
};

