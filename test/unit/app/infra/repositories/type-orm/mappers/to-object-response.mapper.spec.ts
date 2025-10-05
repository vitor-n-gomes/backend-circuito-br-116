import { toObjectResponseMapper } from "@/app/infra/repositories/type-orm/mappers/to-object-response.mapper";

class TestDTO {
  id: number;
  name: string;
}

describe("toObjectResponseMapper", () => {
  it("should map plain object to DTO instance", () => {
    const data = { id: 1, name: "Test" };
    const result = toObjectResponseMapper(data, TestDTO);

    expect(result).toBeInstanceOf(TestDTO);
    expect(result).toEqual(expect.objectContaining({ id: 1, name: "Test" }));
  });

  it("should handle empty data", () => {
    const result = toObjectResponseMapper({}, TestDTO);
    expect(result).toBeInstanceOf(TestDTO);
  });
});
