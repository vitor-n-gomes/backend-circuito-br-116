import { Module } from "@nestjs/common";
import { ContactModule } from "./contact/contact.module";
import { BusinessModule } from "./business/business.module";
import { CategoriesModule } from "./categories/categories.module";
import { CommentsModule } from "./comments/comments.module";
import { AssetsModule } from "./assets/assets.module";
import { LocationModule } from "./location/location.module";
import { SearchHistoryModule } from "./search-history/search-history.module";
import { LastSeenBusinessModule } from "./last-seen-business/last-seen-business.module";
import { AccountsModule } from "./accounts/accounts.module";

@Module({
  imports: [
    ContactModule,
    BusinessModule,
    CategoriesModule,
    CommentsModule,
    AssetsModule,
    LocationModule,
    SearchHistoryModule,
    LastSeenBusinessModule,
    AccountsModule,
  ],
})
export class HomeModule {}
