import { Module } from '@nestjs/common';
import { LastSeenBusinessController } from './controllers/last-seen-business.controller';
import { GetLastSeenBusinessesByAccountCase } from './use-cases/get-last-seen-businesses-by-account.case';
import { RecordLastSeenBusinessCase } from './use-cases/record-last-seen-business.case';
import { InfraModule } from '@/app/infra/infra.module';

@Module({
  controllers: [LastSeenBusinessController],
  imports: [InfraModule],
  providers: [GetLastSeenBusinessesByAccountCase, RecordLastSeenBusinessCase],
})
export class LastSeenBusinessModule {}
