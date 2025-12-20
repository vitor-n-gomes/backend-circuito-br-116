import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './models/asset.entity';
import { IAssetRepository } from '../interfaces/asset.interface.repository';
import { AssetResponseDto } from '@/app/home/assets/dtos/responses/asset.response.dto';
import { CreateAssetDto } from '@/app/home/assets/dtos/requests/create-asset.request.dto';
import { toObjectResponseMapper } from './mappers/to-object-response.mapper';

@Injectable()
export class AssetRepository implements IAssetRepository {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>
  ) {}

  async findById(id: string): Promise<AssetResponseDto | null> {
    const asset = await this.assetRepo.findOne({ where: { id } });
    return toObjectResponseMapper(asset, AssetResponseDto);
  }

  async findAll(): Promise<AssetResponseDto[]> {
    const assets = await this.assetRepo.find({
      order: { createdAt: 'DESC' },
    });
    return assets.map((a) => toObjectResponseMapper(a, AssetResponseDto));
  }

  async create(data: CreateAssetDto): Promise<AssetResponseDto> {
    const asset = this.assetRepo.create(data);
    const saved = await this.assetRepo.save(asset);
    return toObjectResponseMapper(saved, AssetResponseDto);
  }

  async delete(id: string): Promise<void> {
    await this.assetRepo.delete({ id });
  }
}
