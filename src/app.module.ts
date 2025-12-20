import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HomeModule } from "./app/home/home.module";
import { InfraModule } from "./app/infra/infra.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InfraModule,
    HomeModule,
  ],
})
export class AppModule {}
