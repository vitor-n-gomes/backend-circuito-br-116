import { toPaginationResponseMapper } from "@/app/infra/repositories/mappers/to-pagination-response.mapper";

class TestDTO {
  id: number;
  name: string;
}

describe("toPaginationResponseMapper", () => {
  it("should map array of plain objects to DTOs and return correct pagination", () => {
    const data = [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ];
    const total = 5;
    const page = 1;
    const limit = 2;

    const result = toPaginationResponseMapper(data, total, page, limit, TestDTO);

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toBeInstanceOf(TestDTO);
    expect(result.data[1]).toBeInstanceOf(TestDTO);
    expect(result.currentPage).toBe(1);
    expect(result.totalElements).toBe(5);
    expect(result.nextPage).toBe(2);
    expect(result.lastPage).toBe(3);
    expect(result.firstPage).toBe(1);
    expect(result.previousPage).toBeNull();
  });

  it("should set nextPage to null on last page", () => {
    const data = [{ id: 3, name: "C" }];
    const total = 3;
    const page = 3;
    const limit = 1;

    const result = toPaginationResponseMapper(data, total, page, limit, TestDTO);

    expect(result.nextPage).toBeNull();
    expect(result.previousPage).toBe(2);
    expect(result.lastPage).toBe(3);
  });

  it("should set previousPage to null on first page", () => {
    const data = [{ id: 1, name: "A" }];
    const total = 1;
    const page = 1;
    const limit = 1;

    const result = toPaginationResponseMapper(data, total, page, limit, TestDTO);

    expect(result.previousPage).toBeNull();
    expect(result.firstPage).toBe(1);
  });
});
