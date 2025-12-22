import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DomainModule } from "./app/domain/domain.module";
import { InfraModule } from "./app/infra/infra.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InfraModule,
    DomainModule,
  ],
})
export class AppModule {}
