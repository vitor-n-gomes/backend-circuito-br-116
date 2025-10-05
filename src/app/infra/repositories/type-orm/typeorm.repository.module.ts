import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ContactRepository } from "./contact.repository";
import { IContactRepository } from "../interfaces/contact.interface.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Contact } from "./models/contact.entity";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USER', 'root'),
        password: configService.get('DB_PASS', ''),
        database: configService.get('DB_NAME', ''),
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Contact])
  ],
  providers: [
    {
      provide: IContactRepository,
      useClass: ContactRepository,
    },
  ],
  exports: [IContactRepository],
})
export class TypeOrmRepositoryModule { }
