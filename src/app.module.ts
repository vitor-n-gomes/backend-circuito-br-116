import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HomeModule } from "./app/home/home.modules";

@Module({
  imports: [
    HomeModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
