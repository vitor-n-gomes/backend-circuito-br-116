import { Injectable, Inject } from '@nestjs/common';
import { CreateAssetDto } from '../dtos/requests/create-asset.request.dto';
import { AssetResponseDto } from '../dtos/responses/asset.response.dto';
import { IAssetRepository } from '@/app/infra/repositories/interfaces/asset.interface.repository';

@Injectable()
export class CreateAssetCase {
  constructor(
    @Inject(IAssetRepository)
    private readonly assetRepository: IAssetRepository
  ) {}

  async execute(data: CreateAssetDto): Promise<AssetResponseDto> {
    return await this.assetRepository.create(data);
  }
}
