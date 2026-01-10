import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IGoogleMapsService } from './interfaces/google-maps.interface.service';
import { GoogleMapsService } from './google-maps.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: IGoogleMapsService,
      useClass: GoogleMapsService,
    },
  ],
  exports: [IGoogleMapsService],
})
export class GoogleMapsModule {}
