import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IMapsService } from './interfaces/maps.interface.service';
import { GoogleMapsService } from './google-maps/google-maps.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: IMapsService,
      useClass: GoogleMapsService,
    },
  ],
  exports: [IMapsService],
})
export class MapsModule {}
