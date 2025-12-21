import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiParam, ApiOperation } from '@nestjs/swagger';
import { CreateAssetDto } from '../dtos/requests/create-asset.request.dto';
import { AssetResponseDto } from '../dtos/responses/asset.response.dto';
import { CreateAssetCase } from '../use-cases/create-asset.case';
import { GetAssetByIdCase } from '../use-cases/get-asset-by-id.case';
import { DeleteAssetCase } from '../use-cases/delete-asset.case';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(
    private readonly createAssetCase: CreateAssetCase,
    private readonly getAssetByIdCase: GetAssetByIdCase,
    private readonly deleteAssetCase: DeleteAssetCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiResponse({ status: 201, type: AssetResponseDto })
  async create(
    @Body(new ValidationPipe({ transform: true })) data: CreateAssetDto
  ): Promise<AssetResponseDto> {
    return await this.createAssetCase.execute(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: AssetResponseDto })
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<AssetResponseDto> {
    return await this.getAssetByIdCase.execute(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200 })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<{ success: boolean }> {
    await this.deleteAssetCase.execute(id);
    return { success: true };
  }
}
