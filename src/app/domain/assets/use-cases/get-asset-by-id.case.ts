import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AssetResponseDto } from '../dtos/responses/asset.response.dto';
import { IAssetRepository } from '@/app/infra/repositories/interfaces/asset.interface.repository';

@Injectable()
export class GetAssetByIdCase {
  constructor(
    @Inject(IAssetRepository)
    private readonly assetRepository: IAssetRepository
  ) {}

  async execute(id: string): Promise<AssetResponseDto> {
    const asset = await this.assetRepository.findById(id);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }
}
