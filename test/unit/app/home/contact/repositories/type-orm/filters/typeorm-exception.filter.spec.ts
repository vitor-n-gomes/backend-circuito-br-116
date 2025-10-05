import { TypeOrmExceptionFilter } from "@/app/infra/repositories/type-orm/filters/typeorm-exception.filter";
import { QueryFailedError, EntityNotFoundError } from "typeorm";
import { ArgumentsHost, HttpStatus } from "@nestjs/common";

describe("TypeOrmExceptionFilter", () => {
  let filter: TypeOrmExceptionFilter;
  let mockResponse: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new TypeOrmExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as any;
  });

  it("should handle QueryFailedError with BAD_REQUEST", () => {
    const error = new QueryFailedError("SELECT 1", [], new Error("fail"));
    (error as any).message = "Query failed";

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: "Query failed",
      error: "QueryFailedError",
    });
  });

  it("should handle EntityNotFoundError with NOT_FOUND", () => {
    const error = new EntityNotFoundError("User", { id: 1 });

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: "Entity not found",
      error: "EntityNotFoundError",
    });
  });

  it("should handle unknown error with INTERNAL_SERVER_ERROR", () => {
    const error = { name: "OtherError", message: "Something else" };

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Database error occurred",
      error: "OtherError",
    });
  });
});
