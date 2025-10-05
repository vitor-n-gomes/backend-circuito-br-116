import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { QueryFailedError, EntityNotFoundError } from "typeorm";

@Catch(QueryFailedError, EntityNotFoundError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Database error occurred";

    if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = (exception as any).message;
    }

    if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = "Entity not found";
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.name,
    });
  }
}
