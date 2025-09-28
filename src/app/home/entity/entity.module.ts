import { Module } from '@nestjs/common';
import { EntityController } from './controller/entity.controller';

@Module({
  imports: [],
  controllers: [EntityController],
  providers: [],
  exports: [],
})
export class EntityModule {}
