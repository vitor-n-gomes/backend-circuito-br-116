import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IAssetRepository } from '@/app/infra/repositories/interfaces/asset.interface.repository';

@Injectable()
export class DeleteAssetCase {
  constructor(
    @Inject(IAssetRepository)
    private readonly assetRepository: IAssetRepository
  ) {}

  async execute(id: string): Promise<void> {
    const asset = await this.assetRepository.findById(id);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    await this.assetRepository.delete(id);
  }
}
