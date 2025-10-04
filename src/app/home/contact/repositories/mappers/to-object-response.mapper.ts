import { plainToInstance } from "class-transformer";

export function toObjectResponseMapper<EntityDTO, responseDTO extends object>(
  data: EntityDTO,
  dtoClass: new () => responseDTO
): responseDTO {

  return plainToInstance(dtoClass, data);
  
}