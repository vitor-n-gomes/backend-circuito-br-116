import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { CreateLastSeenBusinessDto } from '../dtos/requests/create-last-seen-business.request.dto';
import { LastSeenBusinessResponseDto } from '../dtos/responses/last-seen-business.response.dto';
import { GetLastSeenBusinessesByAccountCase } from '../use-cases/get-last-seen-businesses-by-account.case';
import { RecordLastSeenBusinessCase } from '../use-cases/record-last-seen-business.case';

@ApiTags('Last Seen Business')
@Controller('last-seen-business')
export class LastSeenBusinessController {
  constructor(
    private readonly getLastSeenBusinessesByAccountCase: GetLastSeenBusinessesByAccountCase,
    private readonly recordLastSeenBusinessCase: RecordLastSeenBusinessCase
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get last seen businesses by account' })
  @ApiQuery({ name: 'accountId', type: 'number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 20 })
  @ApiResponse({ status: 200, type: [LastSeenBusinessResponseDto] })
  async getByAccount(
    @Query('accountId', ParseIntPipe) accountId: number,
    @Query('limit') limit?: number
  ): Promise<LastSeenBusinessResponseDto[]> {
    return await this.getLastSeenBusinessesByAccountCase.execute(accountId, limit);
  }

  @Post()
  @ApiOperation({ summary: 'Record a last seen business' })
  @ApiQuery({ name: 'accountId', type: 'number' })
  @ApiResponse({ status: 201, type: LastSeenBusinessResponseDto })
  async record(
    @Body(new ValidationPipe({ transform: true })) data: CreateLastSeenBusinessDto,
    @Query('accountId', ParseIntPipe) accountId: number
  ): Promise<LastSeenBusinessResponseDto> {
    return await this.recordLastSeenBusinessCase.execute(accountId, data);
  }
}
