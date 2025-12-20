import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ContactRepository } from "./contact.repository";
import { IContactRepository } from "../interfaces/contact.interface.repository";
import { BusinessRepository } from "./business.repository";
import { IBusinessRepository } from "../interfaces/business.interface.repository";
import { CategoryRepository } from "./category.repository";
import { ICategoryRepository } from "../interfaces/category.interface.repository";
import { CommentRepository } from "./comment.repository";
import { ICommentRepository } from "../interfaces/comment.interface.repository";
import { AssetRepository } from "./asset.repository";
import { IAssetRepository } from "../interfaces/asset.interface.repository";
import { LocationRepository } from "./location.repository";
import { ILocationRepository } from "../interfaces/location.interface.repository";
import { SearchHistoryRepository } from "./search-history.repository";
import { ISearchHistoryRepository } from "../interfaces/search-history.interface.repository";
import { LastSeenBusinessRepository } from "./last-seen-business.repository";
import { ILastSeenBusinessRepository } from "../interfaces/last-seen-business.interface.repository";
import { AccountRepository } from "./account.repository";
import { IAccountRepository } from "../interfaces/account.interface.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Contact } from "./models/contact.entity";
import { Business } from "./models/business.entity";
import { Category } from "./models/category.entity";
import { Location } from "./models/location.entity";
import { Asset } from "./models/asset.entity";
import { Comment } from "./models/comment.entity";
import { SearchHistory } from "./models/search-history.entity";
import { LastSeenBusiness } from "./models/last-seen-business.entity";
import { BusinessMapCluster } from "./models/business-map-cluster.entity";
import { Account } from "./models/account.entity";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASS', ''),
        database: configService.get('DB_NAME', ''),
        autoLoadEntities: true,
        synchronize: false,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      Contact,
      Business,
      Category,
      Location,
      Asset,
      Comment,
      SearchHistory,
      LastSeenBusiness,
      BusinessMapCluster,
      Account,
    ])
  ],
  providers: [
    {
      provide: IContactRepository,
      useClass: ContactRepository,
    },
    {
      provide: IBusinessRepository,
      useClass: BusinessRepository,
    },
    {
      provide: ICategoryRepository,
      useClass: CategoryRepository,
    },
    {
      provide: ICommentRepository,
      useClass: CommentRepository,
    },
    {
      provide: IAssetRepository,
      useClass: AssetRepository,
    },
    {
      provide: ILocationRepository,
      useClass: LocationRepository,
    },
    {
      provide: ISearchHistoryRepository,
      useClass: SearchHistoryRepository,
    },
    {
      provide: ILastSeenBusinessRepository,
      useClass: LastSeenBusinessRepository,
    },
    {
      provide: IAccountRepository,
      useClass: AccountRepository,
    },
  ],
  exports: [
    IContactRepository,
    IBusinessRepository,
    ICategoryRepository,
    ICommentRepository,
    IAssetRepository,
    ILocationRepository,
    ISearchHistoryRepository,
    ILastSeenBusinessRepository,
    IAccountRepository,
  ],
})
export class TypeOrmRepositoryModule { }
