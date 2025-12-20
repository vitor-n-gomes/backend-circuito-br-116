import { Module } from '@nestjs/common';
import { AssetsController } from './controllers/assets.controller';
import { CreateAssetCase } from './use-cases/create-asset.case';
import { GetAssetByIdCase } from './use-cases/get-asset-by-id.case';
import { DeleteAssetCase } from './use-cases/delete-asset.case';
import { InfraModule } from '@/app/infra/infra.module';

@Module({
  controllers: [AssetsController],
  imports: [InfraModule],
  providers: [CreateAssetCase, GetAssetByIdCase, DeleteAssetCase],
})
export class AssetsModule {}
