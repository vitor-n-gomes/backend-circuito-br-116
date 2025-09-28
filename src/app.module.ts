import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HomeModule } from "./app/home/home.modules";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    HomeModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      database: process.env.DB_NAME || "",
      autoLoadEntities: true,
      synchronize: false,
    }),
  ],
})
export class AppModule {}
