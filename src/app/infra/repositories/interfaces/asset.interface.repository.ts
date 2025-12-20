import { AssetResponseDto } from '../../../home/assets/dtos/responses/asset.response.dto';
import { CreateAssetDto } from '../../../home/assets/dtos/requests/create-asset.request.dto';

export abstract class IAssetRepository {
  abstract findById(id: string): Promise<AssetResponseDto | null>;
  
  abstract findAll(): Promise<AssetResponseDto[]>;
  
  abstract create(data: CreateAssetDto): Promise<AssetResponseDto>;
  
  abstract delete(id: string): Promise<void>;
}
